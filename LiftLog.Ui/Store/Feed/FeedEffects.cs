using System.Collections.Immutable;
using System.Text;
using Fluxor;
using Google.Protobuf;
using LiftLog.Lib.Models;
using LiftLog.Lib.Services;
using LiftLog.Ui.Models;
using LiftLog.Ui.Services;
using LiftLog.Ui.Util;
using static LiftLog.Lib.Models.UserEventPayload;

namespace LiftLog.Ui.Store.Feed;

public class FeedEffects(
    IState<FeedState> state,
    FeedApiService feedApiService,
    IEncryptionService encryptionService,
    IKeyValueStore keyValueStore
)
{
    [EffectMethod]
    public async Task HandleFetchSessionFeedItemsAction(
        FetchSessionFeedItemsAction _,
        IDispatcher dispatcher
    )
    {
        if (state.Value.Identity is null || state.Value.Users.IsEmpty)
        {
            return;
        }
        var response = await feedApiService.GetUserEventsAsync(
            new GetEventsRequest(
                UserIds: state.Value.Users.Keys.ToArray(),
                Since: state.Value.Feed.MaxBy(x => x.Timestamp)?.Timestamp
                    ?? DateTimeOffset.MinValue
            )
        );
        if (response.Events.Any())
        {
            var feedItems = (
                await Task.WhenAll(response.Events.Select(x => ToFeedItemAsync(x).AsTask()))
            ).WhereNotNull();
            var now = DateTimeOffset.UtcNow;
            dispatcher.Dispatch(
                new ReplaceFeedItemsAction(
                    state.Value.Feed.Concat(feedItems).Where(x => x.Expiry >= now).ToImmutableList()
                )
            );
        }
    }

    [EffectMethod]
    public async Task HandleAddFeedUserAction(AddFeedUserAction action, IDispatcher dispatcher)
    {
        var response = await feedApiService.GetUserAsync(action.Id);
        var user = new FeedUser(
            Id: action.Id,
            EncryptionKey: action.EncryptionKey,
            Name: response.EncryptedName is null or { Length: 0 }
                ? action.Name
                : Encoding.UTF8.GetString(
                    await encryptionService.DecryptAsync(
                        response.EncryptedName,
                        action.EncryptionKey,
                        response.EncryptionIV
                    )
                ),
            CurrentPlan: response.EncryptedCurrentPlan is null or { Length: 0 }
                ? []
                : CurrentPlanDaoV1
                    .Parser.ParseFrom(
                        await encryptionService.DecryptAsync(
                            response.EncryptedCurrentPlan,
                            action.EncryptionKey,
                            response.EncryptionIV
                        )
                    )
                    .Sessions.Select(sessionBlueprintDao => sessionBlueprintDao.ToModel())
                    .ToImmutableList(),
            ProfilePicture: response.EncryptedProfilePicture is null or { Length: 0 }
                ? null
                : await encryptionService.DecryptAsync(
                    response.EncryptedProfilePicture,
                    action.EncryptionKey,
                    response.EncryptionIV
                )
        );

        dispatcher.Dispatch(new PutFeedUserAction(user));
    }

    [EffectMethod]
    public async Task HandleCreateFeedIdentityAction(
        CreateFeedIdentityAction action,
        IDispatcher dispatcher
    )
    {
        var response = await feedApiService.CreateUserAsync(new CreateUserRequest(Id: action.Id));
        var encryptionKey = await encryptionService.GenerateKeyAsync();
        await GenerateAndPutFeedIdentityAsync(
            dispatcher,
            action.Id,
            response.Password,
            encryptionKey,
            action.Name,
            action.ProfilePicture
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
            action.ProfilePicture
        );
    }

    private async Task GenerateAndPutFeedIdentityAsync(
        IDispatcher dispatcher,
        Guid id,
        string password,
        byte[] encryptionKey,
        string? name,
        byte[]? profilePicture
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

        await feedApiService.PutUserDataAsync(
            new PutUserDataRequest(
                Id: id,
                Password: password,
                EncryptedCurrentPlan: null,
                EncryptedName: encryptedName,
                EncryptedProfilePicture: encryptedProfilePicture,
                EncryptionIV: iv
            )
        );

        var identity = new FeedIdentity(
            Id: id,
            EncryptionKey: encryptionKey,
            Password: password,
            Name: name,
            ProfilePicture: profilePicture
        );

        dispatcher.Dispatch(new PutFeedIdentityAction(identity));
        dispatcher.Dispatch(
            new PutFeedUserAction(
                new FeedUser(
                    Id: id,
                    EncryptionKey: encryptionKey,
                    Name: "You",
                    CurrentPlan: [],
                    ProfilePicture: profilePicture
                )
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
        if (payload is not { EventPayloadCase: EventPayloadOneofCase.Session })
        {
            return null;
        }
        return new SessionFeedItem(
            UserId: userEvent.UserId,
            EventId: userEvent.EventId,
            Timestamp: userEvent.Timestamp,
            Expiry: userEvent.Expiry,
            Session: payload.Session.ToModel()
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
