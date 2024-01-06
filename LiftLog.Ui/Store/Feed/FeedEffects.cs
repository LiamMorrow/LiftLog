using System.Collections.Immutable;
using System.Text;
using Fluxor;
using Google.Protobuf;
using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Lib.Services;
using LiftLog.Ui.Models;
using LiftLog.Ui.Models.SessionHistoryDao;
using LiftLog.Ui.Services;
using LiftLog.Ui.Store.Program;
using LiftLog.Ui.Util;
using Microsoft.Extensions.Logging;
using static LiftLog.Ui.Models.UserEventPayload;

namespace LiftLog.Ui.Store.Feed;

public class FeedEffects(
    IState<FeedState> state,
    IState<ProgramState> programState,
    FeedApiService feedApiService,
    IEncryptionService encryptionService,
    IKeyValueStore keyValueStore,
    ILogger<FeedEffects> logger
)
{
    [EffectMethod]
    public async Task HandleRequestFollowSharedUserAction(
        RequestFollowSharedUserAction action,
        IDispatcher dispatcher
    )
    {
        var identity = state.Value.Identity;
        if (identity == null)
        {
            return;
        }

        var inboxMessage = new InboxMessageDao
        {
            FromUserId = identity.Id,
            FollowRequest = new FollowRequestDao
            {
                Name = identity.Name,
                ProfilePicture = ByteString.CopyFrom(identity.ProfilePicture ?? []),
                PublicKey = ByteString.CopyFrom(identity.PublicKey)
            }
        };
        var response = await feedApiService.PutInboxMessageAsync(
            new PutInboxMessageRequest(
                ToUserId: action.FeedUser.Id,
                EncryptedMessage: await encryptionService.EncryptRsaAsync(
                    inboxMessage.ToByteArray(),
                    action.FeedUser.PublicKey
                )
            )
        );
        if (!response.IsSuccess)
        {
            // TODO handle properly
            return;
        }

        dispatcher.Dispatch(new PutFeedUserAction(action.FeedUser));
    }

    [EffectMethod]
    public async Task HandleFetchSessionFeedItemsAction(
        FetchSessionFeedItemsAction _,
        IDispatcher dispatcher
    )
    {
        if (state.Value.Users.IsEmpty)
        {
            return;
        }
        var feedResponseTask = feedApiService.GetUserEventsAsync(
            new GetEventsRequest(
                Users: state
                    .Value.Users.Where(x => x.Value.FollowSecret is not null)
                    .Select(x => new GetUserEventRequest(x.Key, x.Value.FollowSecret!))
                    .ToArray(),
                Since: state.Value.Feed.MaxBy(x => x.Timestamp)?.Timestamp
                    ?? DateTimeOffset.MinValue
            )
        );
        var originalUsers = state.Value.Users;
        var userResponseTask = feedApiService.GetUsersAsync(
            new GetUsersRequest(originalUsers.Keys.ToArray())
        );

        var feedResponse = await feedResponseTask;
        var usersResponse = await userResponseTask;

        if (!usersResponse.IsSuccess || !feedResponse.IsSuccess)
        {
            // TODO handle properly
            return;
        }
        var feedEvents = feedResponse.Data.Events;
        var invalidFollowSecrets = feedResponse.Data.InvalidFollowSecrets;
        var users = usersResponse.Data.Users;

        var newUsers = (
            await Task.WhenAll(
                users.Select(
                    x =>
                        originalUsers[x.Key].AesKey is null
                            ? Task.FromResult(originalUsers[x.Key])
                            : GetDecryptedUserAsync(
                                x.Key,
                                originalUsers[x.Key].PublicKey,
                                originalUsers[x.Key].AesKey!,
                                originalUsers[x.Key].Nickname,
                                x.Value,
                                originalUsers[x.Key].FollowSecret
                            )
                )
            )
        )
            .Where(x => !invalidFollowSecrets.Contains(x.FollowSecret))
            .ToImmutableList();
        dispatcher.Dispatch(new ReplaceFeedUsersAction(newUsers));

        var feedItems = (
            await Task.WhenAll(
                feedEvents
                    .Where(ev => newUsers.Any(us => us.Id == ev.UserId))
                    .Select(x => ToFeedItemAsync(x).AsTask())
            )
        ).WhereNotNull();
        var now = DateTimeOffset.UtcNow;
        dispatcher.Dispatch(
            new ReplaceFeedItemsAction(
                state
                    .Value.Feed.Concat(feedItems)
                    .Where(x => x.Expiry >= now)
                    .DistinctBy(x => x.EventId)
                    .Where(ev => newUsers.Any(us => us.Id == ev.UserId))
                    .OrderByDescending(x => x.Timestamp)
                    .ToImmutableList()
            )
        );
    }

    [EffectMethod]
    public async Task HandleDeleteFeedIdentityAction(
        DeleteFeedIdentityAction _,
        IDispatcher dispatcher
    )
    {
        var identity = state.Value.Identity;
        if (identity is null)
        {
            return;
        }
        var response = await feedApiService.DeleteUserAsync(
            new DeleteUserRequest(Id: identity.Id, Password: identity.Password)
        );
        if (!response.IsSuccess && response.Error.Type != ApiErrorType.NotFound)
        {
            // TODO handle properly
            return;
        }
        dispatcher.Dispatch(new PutFeedIdentityAction(null));
        dispatcher.Dispatch(new DeleteFeedUserAction(identity.Id));
        dispatcher.Dispatch(new SetIsLoadingIdentityAction(false));
    }

    [EffectMethod]
    public async Task HandleCreateFeedIdentityAction(
        CreateFeedIdentityAction action,
        IDispatcher dispatcher
    )
    {
        if (state.Value.IsLoadingIdentity)
        {
            return;
        }
        dispatcher.Dispatch(new SetIsLoadingIdentityAction(true));
        var response = await feedApiService.CreateUserAsync(new CreateUserRequest(Id: action.Id));
        if (!response.IsSuccess)
        {
            dispatcher.Dispatch(new SetIsLoadingIdentityAction(false));
            // TODO handle properly
            return;
        }
        var encryptionKey = await encryptionService.GenerateAesKeyAsync();
        var (publicKey, privateKey) = await encryptionService.GenerateRsaKeysAsync();
        await GenerateAndPutFeedIdentityAsync(
            dispatcher,
            action.Id,
            response.Data.Password,
            encryptionKey,
            publicKey,
            privateKey,
            action.Name,
            action.ProfilePicture,
            action.PublishBodyweight,
            action.PublishPlan
        );
        dispatcher.Dispatch(new SetIsLoadingIdentityAction(false));
    }

    [EffectMethod]
    public async Task HandleUpdateFeedIdentityAction(
        UpdateFeedIdentityAction action,
        IDispatcher dispatcher
    )
    {
        if (state.Value.Identity is null)
        {
            return;
        }
        await GenerateAndPutFeedIdentityAsync(
            dispatcher,
            state.Value.Identity.Id,
            state.Value.Identity.Password,
            state.Value.Identity.AesKey,
            state.Value.Identity.PublicKey,
            state.Value.Identity.PrivateKey,
            action.Name,
            action.ProfilePicture,
            action.PublishBodyweight,
            action.PublishPlan
        );
    }

    [EffectMethod]
    public async Task PublishIdentityIfEnabled(
        PublishIdentityIfEnabledAction _,
        IDispatcher dispatcher
    )
    {
        if (state.Value.Identity is null)
        {
            return;
        }
        await GenerateAndPutFeedIdentityAsync(
            dispatcher,
            state.Value.Identity.Id,
            state.Value.Identity.Password,
            state.Value.Identity.AesKey,
            state.Value.Identity.PublicKey,
            state.Value.Identity.PrivateKey,
            state.Value.Identity.Name,
            state.Value.Identity.ProfilePicture,
            state.Value.Identity.PublishBodyweight,
            state.Value.Identity.PublishPlan
        );
    }

    [EffectMethod]
    public async Task HandlePublishWorkoutToFeedAction(
        PublishWorkoutToFeedAction action,
        IDispatcher dispatcher
    )
    {
        if (state.Value.Identity is null)
        {
            return;
        }
        var (encryptedPayload, iv) = await encryptionService.EncryptAesAsync(
            new UserEventPayload
            {
                SessionPayload = new SessionUserEvent
                {
                    Session = SessionDaoV2.FromModel(
                        action.Session with
                        {
                            Bodyweight = state.Value.Identity.PublishBodyweight
                                ? action.Session.Bodyweight
                                : null
                        }
                    )
                }
            }.ToByteArray(),
            state.Value.Identity.AesKey
        );
        await feedApiService.PutUserEventAsync(
            new PutUserEventRequest(
                UserId: state.Value.Identity.Id,
                Password: state.Value.Identity.Password,
                EncryptedEventPayload: encryptedPayload,
                EncryptedEventIV: iv,
                Expiry: DateTimeOffset.UtcNow.AddDays(90)
            )
        );
    }

    [EffectMethod]
    public async Task HandleFetchInboxItemsAction(FetchInboxItemsAction _, IDispatcher dispatcher)
    {
        var identity = state.Value.Identity;
        if (identity is null)
        {
            return;
        }
        var inboxItemsResponse = await feedApiService.GetInboxMessagesAsync(
            new GetInboxMessagesRequest(identity.Id, identity.Password)
        );
        if (!inboxItemsResponse.IsSuccess)
        {
            // TODO handle properly
            return;
        }

        var encryptedInboxItems = inboxItemsResponse.Data.InboxMessages;
        var inboxItems = (
            await Task.WhenAll(
                encryptedInboxItems.Select(x => DecryptIfValid(x, identity.PrivateKey))
            )
        ).WhereNotNull();

        ImmutableListValue<FollowRequest> newFollowRequests = inboxItems
            .Where(
                x => x.MessagePayloadCase == InboxMessageDao.MessagePayloadOneofCase.FollowRequest
            )
            .Select(
                x =>
                    new FollowRequest(
                        UserId: x.FromUserId,
                        Name: x.FollowRequest.Name?.ToString() ?? "Someone",
                        ProfilePicture: x.FollowRequest.ProfilePicture.IsEmpty
                            ? null
                            : x.FollowRequest.ProfilePicture.ToByteArray(),
                        PublicKey: x.FollowRequest.PublicKey.ToByteArray()
                    )
            )
            .ToImmutableList();
        dispatcher.Dispatch(new AppendNewFollowRequestsAction(newFollowRequests));

        var newFollowResponses = inboxItems
            .Where(
                x => x.MessagePayloadCase == InboxMessageDao.MessagePayloadOneofCase.FollowResponse
            )
            .Select(
                x =>
                    new FollowResponse(
                        UserId: x.FromUserId,
                        Accepted: x.FollowResponse.ResponsePayloadCase
                            == FollowResponseDao.ResponsePayloadOneofCase.Accepted,
                        AesKey: x.FollowResponse.ResponsePayloadCase
                        == FollowResponseDao.ResponsePayloadOneofCase.Accepted
                            ? x.FollowResponse.Accepted.AesKey.ToByteArray()
                            : null,
                        FollowSecret: x.FollowResponse.ResponsePayloadCase
                        == FollowResponseDao.ResponsePayloadOneofCase.Accepted
                            ? x.FollowResponse.Accepted.FollowSecret
                            : null
                    )
            )
            .ToImmutableList();

        dispatcher.Dispatch(new ProcessFollowResponsesAction(newFollowResponses));
    }

    [EffectMethod]
    public Task HandleProcessFollowResponsesAction(
        ProcessFollowResponsesAction action,
        IDispatcher dispatcher
    )
    {
        var acceptResponses = action.Responses.Where(x => x.Accepted).ToDictionary(x => x.UserId);
        var rejectedUsers = action
            .Responses.Where(x => !x.Accepted)
            .Select(x => x.UserId)
            .ToHashSet();
        var usersAfterResponses = state
            .Value.Users.Select(
                x =>
                    acceptResponses.TryGetValue(x.Key, out var value)
                        ? x.Value with
                        {
                            FollowSecret = value.FollowSecret,
                            AesKey = value.AesKey,
                        }
                        : x.Value
            )
            .Where(x => !rejectedUsers.Contains(x.Id))
            .ToImmutableList();

        dispatcher.Dispatch(new ReplaceFeedUsersAction(usersAfterResponses));
        dispatcher.Dispatch(new FetchSessionFeedItemsAction());

        return Task.CompletedTask;
    }

    [EffectMethod]
    public async Task HandleAcceptFollowRequestAction(
        AcceptFollowRequestAction action,
        IDispatcher dispatcher
    )
    {
        var identity = state.Value.Identity;
        if (identity is null)
        {
            return;
        }
        var followSecret =
            state.Value.Followers.FirstOrDefault(x => x.Id == action.Request.UserId)?.FollowSecret
            ?? Guid.NewGuid().ToString();
        var putFollowSecretResponse = await feedApiService.PutUserFollowSecretAsync(
            new PutUserFollowSecretRequest(
                UserId: identity.Id,
                Password: identity.Password,
                FollowSecret: followSecret
            )
        );
        if (!putFollowSecretResponse.IsSuccess)
        {
            // TODO handle properly
            return;
        }

        var inboxMessage = new InboxMessageDao
        {
            FromUserId = identity.Id,
            FollowResponse = new FollowResponseDao
            {
                Accepted = new FollowResponseAcceptedDao
                {
                    AesKey = ByteString.CopyFrom(identity.AesKey),
                    FollowSecret = followSecret
                }
            }
        };
        var encryptedMessage = await encryptionService.EncryptRsaAsync(
            inboxMessage.ToByteArray(),
            action.Request.PublicKey
        );
        var putResponse = await feedApiService.PutInboxMessageAsync(
            new PutInboxMessageRequest(
                ToUserId: action.Request.UserId,
                EncryptedMessage: encryptedMessage
            )
        );
        if (!putResponse.IsSuccess)
        {
            if (putResponse.Error.Type == ApiErrorType.NotFound)
            {
                dispatcher.Dispatch(new RemoveFollowRequestAction(action.Request));
            }
            // TODO handle properly
            return;
        }

        dispatcher.Dispatch(
            new AddFollowerAction(
                FeedUser.FromShared(
                    action.Request.UserId,
                    action.Request.PublicKey,
                    action.Request.Name
                ) with
                {
                    FollowSecret = followSecret
                }
            )
        );
        dispatcher.Dispatch(new RemoveFollowRequestAction(action.Request));
    }

    [EffectMethod]
    public async Task HandleDenyFollowRequestAction(
        DenyFollowRequestAction action,
        IDispatcher dispatcher
    )
    {
        var identity = state.Value.Identity;
        if (identity is null)
        {
            return;
        }

        var inboxMessage = new InboxMessageDao
        {
            FromUserId = identity.Id,
            FollowResponse = new FollowResponseDao { Rejected = new FollowResponseRejectedDao() }
        };
        byte[][]? encryptedMessage;
        try
        {
            encryptedMessage = await encryptionService.EncryptRsaAsync(
                inboxMessage.ToByteArray(),
                action.Request.PublicKey
            );
        }
        catch (Exception e)
        {
            logger.LogError(e, "Failed to encrypt inbox message");
            dispatcher.Dispatch(new RemoveFollowRequestAction(action.Request));
            return;
        }
        var putResponse = await feedApiService.PutInboxMessageAsync(
            new PutInboxMessageRequest(
                ToUserId: action.Request.UserId,
                EncryptedMessage: encryptedMessage
            )
        );
        if (!putResponse.IsSuccess && putResponse.Error.Type != ApiErrorType.NotFound)
        {
            // TODO handle properly
            return;
        }

        dispatcher.Dispatch(new RemoveFollowRequestAction(action.Request));
    }

    [EffectMethod]
    public async Task HandleStartRemoveFollowerAction(
        StartRemoveFollowerAction action,
        IDispatcher dispatcher
    )
    {
        var identity = state.Value.Identity;
        if (identity is null)
        {
            return;
        }
        var deleteFollowSecretResponse = await feedApiService.DeleteUserFollowSecretAsync(
            new DeleteUserFollowSecretRequest(
                UserId: identity.Id,
                Password: identity.Password,
                FollowSecret: action.User.FollowSecret!
            )
        );
        if (
            !deleteFollowSecretResponse.IsSuccess
            && deleteFollowSecretResponse.Error.Type != ApiErrorType.NotFound
        )
        {
            // TODO handle properly
            return;
        }
        dispatcher.Dispatch(new RemoveFollowerAction(action.User));
    }

    [EffectMethod]
    public Task PutFeedIdentity(PutFeedIdentityAction action, IDispatcher dispatcher)
    {
        return PersistFeedState();
    }

    [EffectMethod]
    public Task ReplaceFeedItems(ReplaceFeedItemsAction action, IDispatcher dispatcher)
    {
        return PersistFeedState();
    }

    [EffectMethod]
    public Task PutFeedUser(PutFeedUserAction action, IDispatcher dispatcher)
    {
        return PersistFeedState();
    }

    [EffectMethod]
    public Task ReplaceFeedUsers(ReplaceFeedUsersAction action, IDispatcher dispatcher)
    {
        return PersistFeedState();
    }

    [EffectMethod]
    public Task DeleteFeedUser(DeleteFeedUserAction action, IDispatcher dispatcher)
    {
        return PersistFeedState();
    }

    [EffectMethod]
    public Task AppendNewFollowRequests(
        AppendNewFollowRequestsAction action,
        IDispatcher dispatcher
    )
    {
        return PersistFeedState();
    }

    [EffectMethod]
    public Task ProcessFollowResponses(RemoveFollowerAction action, IDispatcher dispatcher)
    {
        return PersistFeedState();
    }

    [EffectMethod]
    public Task AddFollowerAction(AddFollowerAction action, IDispatcher dispatcher)
    {
        return PersistFeedState();
    }

    [EffectMethod]
    public Task RemoveFollowRequestAction(RemoveFollowRequestAction action, IDispatcher dispatcher)
    {
        return PersistFeedState();
    }

    private async Task<InboxMessageDao?> DecryptIfValid(
        GetInboxMessageResponse inboxMessage,
        byte[] privateKey
    )
    {
        try
        {
            var decrypted = await encryptionService.DecryptRsaAsync(
                inboxMessage.EncryptedMessage,
                privateKey
            );
            return InboxMessageDao.Parser.ParseFrom(decrypted);
        }
        catch (Exception e)
        {
            logger.LogError(e, "Failed to decrypt inbox message");
            return null;
        }
    }

    private async Task GenerateAndPutFeedIdentityAsync(
        IDispatcher dispatcher,
        Guid id,
        string password,
        byte[] encryptionKey,
        byte[] publicKey,
        byte[] privateKey,
        string? name,
        byte[]? profilePicture,
        bool publishBodyweight,
        bool publishPlan
    )
    {
        var (_, iv) = await encryptionService.EncryptAesAsync([1], encryptionKey);
        byte[]? encryptedName = name is null
            ? null
            : (
                await encryptionService.EncryptAesAsync(
                    Encoding.UTF8.GetBytes(name),
                    encryptionKey,
                    iv
                )
            ).EncryptedPayload;
        var encryptedProfilePicture = profilePicture is null
            ? null
            : (
                await encryptionService.EncryptAesAsync(profilePicture, encryptionKey, iv)
            ).EncryptedPayload;

        var currentProgram = (CurrentPlanDaoV1?)programState.Value.SessionBlueprints;
        var encryptedPlan =
            currentProgram is null || !publishPlan
                ? null
                : (
                    await encryptionService.EncryptAesAsync(
                        currentProgram.ToByteArray(),
                        encryptionKey,
                        iv
                    )
                ).EncryptedPayload;

        var result = await feedApiService.PutUserDataAsync(
            new PutUserDataRequest(
                Id: id,
                Password: password,
                EncryptedCurrentPlan: encryptedPlan,
                EncryptedName: encryptedName,
                EncryptedProfilePicture: encryptedProfilePicture,
                EncryptionIV: iv
            )
        );
        if (!result.IsSuccess)
        {
            logger.LogError(
                "Failed to put user data for user {Id} with error {Error}",
                id,
                result.Error
            );
            if (result.Error.Type == ApiErrorType.NotFound)
            {
                dispatcher.Dispatch(
                    new CreateFeedIdentityAction(
                        Guid.NewGuid(),
                        name,
                        profilePicture,
                        publishBodyweight,
                        publishPlan
                    )
                );
                return;
            }
            // TODO handle properly
            return;
        }

        var identity = new FeedIdentity(
            Id: id,
            AesKey: encryptionKey,
            PublicKey: publicKey,
            PrivateKey: privateKey,
            Password: password,
            Name: name,
            ProfilePicture: profilePicture,
            PublishBodyweight: publishBodyweight,
            PublishPlan: publishPlan
        );

        dispatcher.Dispatch(new PutFeedIdentityAction(identity));
        // TODO subscribe to self
    }

    private async Task<FeedUser> GetDecryptedUserAsync(
        Guid Id,
        byte[] publicKey,
        byte[] aesKey,
        string? nickname,
        GetUserResponse response,
        string? followSecret
    )
    {
        return new FeedUser(
            Id,
            PublicKey: publicKey,
            AesKey: aesKey,
            Name: response.EncryptedName is null or { Length: 0 }
                ? null
                : Encoding.UTF8.GetString(
                    await encryptionService.DecryptAesAsync(
                        response.EncryptedName,
                        aesKey,
                        response.EncryptionIV
                    )
                ),
            Nickname: nickname,
            CurrentPlan: response.EncryptedCurrentPlan is null or { Length: 0 }
                ? []
                : CurrentPlanDaoV1
                    .Parser.ParseFrom(
                        await encryptionService.DecryptAesAsync(
                            response.EncryptedCurrentPlan,
                            aesKey,
                            response.EncryptionIV
                        )
                    )
                    .Sessions.Select(sessionBlueprintDao => sessionBlueprintDao.ToModel())
                    .ToImmutableList(),
            ProfilePicture: response.EncryptedProfilePicture is null or { Length: 0 }
                ? null
                : await encryptionService.DecryptAesAsync(
                    response.EncryptedProfilePicture,
                    aesKey,
                    response.EncryptionIV
                ),
            FollowSecret: followSecret
        );
    }

    private async ValueTask<FeedItem?> ToFeedItemAsync(UserEventResponse userEvent)
    {
        var userId = userEvent.UserId;
        var encryptedPayload = userEvent.EncryptedEventPayload;
        var payload = await DecryptPayloadAsync(
            userId,
            userEvent.EncryptedEventIV,
            encryptedPayload
        );
        // We only support session events rn
        if (payload is not { EventPayloadCase: EventPayloadOneofCase.SessionPayload })
        {
            return null;
        }
        return new SessionFeedItem(
            UserId: userEvent.UserId,
            EventId: userEvent.EventId,
            Timestamp: userEvent.Timestamp,
            Expiry: userEvent.Expiry,
            Session: payload.SessionPayload.Session.ToModel()
        );
    }

    private async ValueTask<UserEventPayload?> DecryptPayloadAsync(
        Guid userId,
        byte[] iv,
        byte[] encryptedPayload
    )
    {
        var user = state.Value.Users[userId];
        var key = user.AesKey;
        if (key is null)
        {
            return null;
        }
        var decrypted = await encryptionService.DecryptAesAsync(encryptedPayload, key, iv);
        return UserEventPayload.Parser.ParseFrom(decrypted);
    }

    private async Task PersistFeedState()
    {
        await keyValueStore.SetItemAsync($"{FeedStateInitMiddleware.StorageKey}Version", "1");
        await keyValueStore.SetItemAsync(
            FeedStateInitMiddleware.StorageKey,
            ((FeedStateDaoV1)state.Value).ToByteArray()
        );
    }
}
