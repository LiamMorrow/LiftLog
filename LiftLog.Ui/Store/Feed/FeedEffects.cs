using System.Collections.Immutable;
using System.Text;
using Fluxor;
using Google.Protobuf;
using LiftLog.Lib.Models;
using LiftLog.Lib.Services;
using LiftLog.Ui.Models;
using LiftLog.Ui.Models.SessionHistoryDao;
using LiftLog.Ui.Services;
using LiftLog.Ui.Store.Program;
using LiftLog.Ui.Util;
using Microsoft.Extensions.Logging;
using static LiftLog.Lib.Models.UserEventPayload;

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
        var userResponseTask = feedApiService.GetUsersAsync(
            new GetUsersRequest(state.Value.Users.Keys.ToArray())
        );

        var feedResponse = await feedResponseTask;
        var usersResponse = await userResponseTask;

        if (!usersResponse.IsSuccess || !feedResponse.IsSuccess)
        {
            // TODO handle properly
            return;
        }
        var feedEvents = feedResponse.Data.Events;
        var users = usersResponse.Data.Users;

        var newUsers = (
            await Task.WhenAll(
                users.Select(
                    x =>
                        GetDecryptedUserAsync(
                            x.Key,
                            state.Value.Users[x.Key].EncryptionKey,
                            state.Value.Users[x.Key].Nickname,
                            x.Value,
                            state.Value.Users[x.Key].FollowSecret
                        )
                )
            )
        ).ToImmutableList();
        dispatcher.Dispatch(new ReplaceFeedUsersAction(newUsers));

        var feedItems = (
            await Task.WhenAll(feedEvents.Select(x => ToFeedItemAsync(x).AsTask()))
        ).WhereNotNull();
        var now = DateTimeOffset.UtcNow;
        dispatcher.Dispatch(
            new ReplaceFeedItemsAction(
                state
                    .Value.Feed.Concat(feedItems)
                    .Where(x => x.Expiry >= now)
                    .DistinctBy(x => x.EventId)
                    .Where(x => users.ContainsKey(x.UserId))
                    .OrderByDescending(x => x.Timestamp)
                    .ToImmutableList()
            )
        );
    }

    [EffectMethod]
    public async Task HandleFetchSharedFeedUserAction(
        FetchSharedFeedUserAction action,
        IDispatcher dispatcher
    )
    {
        var feedResponse = await feedApiService.GetUserAsync(action.Id);
        var existingUser = state.Value.Users.GetValueOrDefault(action.Id);

        if (!feedResponse.IsSuccess)
        {
            // TODO handle properly
            return;
        }

        dispatcher.Dispatch(
            new SetSharedFeedUserAction(
                await GetDecryptedUserAsync(
                    action.Id,
                    action.EncryptionKey,
                    existingUser?.Nickname,
                    feedResponse.Data,
                    null
                )
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
        if (!response.IsSuccess)
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
        await GenerateAndPutFeedIdentityAsync(
            dispatcher,
            action.Id,
            response.Data.Password,
            encryptionKey,
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
            state.Value.Identity.EncryptionKey,
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
            state.Value.Identity.EncryptionKey,
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
            state.Value.Identity.EncryptionKey
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

    private async Task GenerateAndPutFeedIdentityAsync(
        IDispatcher dispatcher,
        Guid id,
        string password,
        byte[] encryptionKey,
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
            EncryptionKey: encryptionKey,
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
        byte[] encryptionKey,
        string? nickname,
        GetUserResponse response,
        string? followSecret
    )
    {
        return new FeedUser(
            Id,
            EncryptionKey: encryptionKey,
            Name: response.EncryptedName is null or { Length: 0 }
                ? null
                : Encoding.UTF8.GetString(
                    await encryptionService.DecryptAesAsync(
                        response.EncryptedName,
                        encryptionKey,
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
                            encryptionKey,
                            response.EncryptionIV
                        )
                    )
                    .Sessions.Select(sessionBlueprintDao => sessionBlueprintDao.ToModel())
                    .ToImmutableList(),
            ProfilePicture: response.EncryptedProfilePicture is null or { Length: 0 }
                ? null
                : await encryptionService.DecryptAesAsync(
                    response.EncryptedProfilePicture,
                    encryptionKey,
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
        var key = user.EncryptionKey;
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
