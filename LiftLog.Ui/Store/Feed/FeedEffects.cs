using System.Collections.Immutable;
using System.Text;
using Fluxor;
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
    IEncryptionService encryptionService
)
{
    [EffectMethod]
    public async Task HandleFetchSessionFeedItemsAction(
        FetchSessionFeedItemsAction _,
        IDispatcher dispatcher
    )
    {
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
                        response.EncryptionIV,
                        action.EncryptionKey
                    )
                ),
            CurrentPlan: response.EncryptedCurrentPlan is null or { Length: 0 }
                ? []
                : CurrentPlanDaoV1
                    .Parser.ParseFrom(
                        await encryptionService.DecryptAsync(
                            response.EncryptedCurrentPlan,
                            response.EncryptionIV,
                            action.EncryptionKey
                        )
                    )
                    .Sessions.Select(sessionBlueprintDao => sessionBlueprintDao.ToModel())
                    .ToImmutableList(),
            ProfilePicture: response.EncryptedProfilePicture is null or { Length: 0 }
                ? null
                : await encryptionService.DecryptAsync(
                    response.EncryptedProfilePicture,
                    response.EncryptionIV,
                    action.EncryptionKey
                )
        );

        dispatcher.Dispatch(new PutFeedUserAction(user));
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
        var decrypted = await encryptionService.DecryptAsync(encryptedPayload, iv, key);
        return UserEventPayload.Parser.ParseFrom(decrypted);
    }
}
