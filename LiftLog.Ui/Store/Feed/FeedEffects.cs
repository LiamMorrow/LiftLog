using System.Collections.Immutable;
using System.Text;
using Fluxor;
using Google.Protobuf;
using LiftLog.Lib.Models;
using LiftLog.Lib.Services;
using LiftLog.Ui.Models;
using LiftLog.Ui.Models.SessionHistoryDao;
using LiftLog.Ui.Services;
using LiftLog.Ui.Util;
using Microsoft.Extensions.Logging;
using static LiftLog.Lib.Models.UserEventPayload;

namespace LiftLog.Ui.Store.Feed;

public class FeedEffects(
    IState<FeedState> state,
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
                UserIds: state.Value.Users.Keys.ToArray(),
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
                            x.Value
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
                    feedResponse.Data
                )
            )
        );
    }

    [EffectMethod]
    public async Task HandleCreateFeedIdentityAction(
        CreateFeedIdentityAction action,
        IDispatcher dispatcher
    )
    {
        var response = await feedApiService.CreateUserAsync(new CreateUserRequest(Id: action.Id));
        if (!response.IsSuccess)
        {
            // TODO handle properly
            return;
        }
        var encryptionKey = await encryptionService.GenerateKeyAsync();
        await GenerateAndPutFeedIdentityAsync(
            dispatcher,
            action.Id,
            response.Data.Password,
            encryptionKey,
            action.Name,
            action.ProfilePicture,
            action.PublishBodyweight
        );
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
            action.PublishBodyweight
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
        var (encryptedPayload, iv) = await encryptionService.EncryptAsync(
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
        bool publishBodyweight
    )
    {
        var (_, iv) = await encryptionService.EncryptAsync([1], encryptionKey);
        byte[]? encryptedName = name is null
            ? null
            : (
                await encryptionService.EncryptAsync(
                    Encoding.UTF8.GetBytes(name),
                    encryptionKey,
                    iv
                )
            ).EncryptedPayload;
        var encryptedProfilePicture = profilePicture is null
            ? null
            : (
                await encryptionService.EncryptAsync(profilePicture, encryptionKey, iv)
            ).EncryptedPayload;

        var result = await feedApiService.PutUserDataAsync(
            new PutUserDataRequest(
                Id: id,
                Password: password,
                EncryptedCurrentPlan: null,
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
                        publishBodyweight
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
            PublishBodyweight: publishBodyweight
        );

        dispatcher.Dispatch(new PutFeedIdentityAction(identity));
        dispatcher.Dispatch(
            new PutFeedUserAction(
                new FeedUser(
                    Id: id,
                    EncryptionKey: encryptionKey,
                    Name: "You",
                    Nickname: "You",
                    CurrentPlan: [],
                    ProfilePicture: profilePicture
                )
            )
        );
    }

    private async Task<FeedUser> GetDecryptedUserAsync(
        Guid Id,
        byte[] encryptionKey,
        string? nickname,
        GetUserResponse response
    )
    {
        return new FeedUser(
            Id,
            EncryptionKey: encryptionKey,
            Name: response.EncryptedName is null or { Length: 0 }
                ? null
                : Encoding.UTF8.GetString(
                    await encryptionService.DecryptAsync(
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
                        await encryptionService.DecryptAsync(
                            response.EncryptedCurrentPlan,
                            encryptionKey,
                            response.EncryptionIV
                        )
                    )
                    .Sessions.Select(sessionBlueprintDao => sessionBlueprintDao.ToModel())
                    .ToImmutableList(),
            ProfilePicture: response.EncryptedProfilePicture is null or { Length: 0 }
                ? null
                : await encryptionService.DecryptAsync(
                    response.EncryptedProfilePicture,
                    encryptionKey,
                    response.EncryptionIV
                )
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
        var decrypted = await encryptionService.DecryptAsync(encryptedPayload, key, iv);
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
