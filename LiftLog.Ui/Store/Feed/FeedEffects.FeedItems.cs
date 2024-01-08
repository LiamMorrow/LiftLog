using System.Collections.Immutable;
using Fluxor;
using Google.Protobuf;
using LiftLog.Lib.Models;
using LiftLog.Lib.Services;
using LiftLog.Ui.Models;
using LiftLog.Ui.Models.SessionHistoryDao;
using LiftLog.Ui.Util;
using Microsoft.Extensions.Logging;
using static LiftLog.Ui.Models.UserEventPayload;

namespace LiftLog.Ui.Store.Feed;

public partial class FeedEffects
{
    [EffectMethod]
    public async Task HandleFetchSessionFeedItemsAction(
        FetchSessionFeedItemsAction _,
        IDispatcher dispatcher
    )
    {
        var followedUsers = state.Value.FollowedUsers;
        if (followedUsers.IsEmpty)
        {
            return;
        }
        var feedResponseTask = feedApiService.GetUserEventsAsync(
            new GetEventsRequest(
                Users: followedUsers
                    .Where(x => x.Value.FollowSecret is not null)
                    .Select(x => new GetUserEventRequest(x.Key, x.Value.FollowSecret!))
                    .ToArray(),
                Since: state.Value.Feed.MaxBy(x => x.Timestamp)?.Timestamp
                    ?? DateTimeOffset.MinValue
            )
        );
        var originalFollowedUsers = followedUsers;
        var userResponseTask = feedApiService.GetUsersAsync(
            new GetUsersRequest(originalFollowedUsers.Keys.ToArray())
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
                        originalFollowedUsers[x.Key].AesKey is null
                            ? Task.FromResult(originalFollowedUsers[x.Key])
                            : GetDecryptedUserAsync(
                                x.Key,
                                originalFollowedUsers[x.Key].PublicKey,
                                originalFollowedUsers[x.Key].AesKey!,
                                originalFollowedUsers[x.Key].Nickname,
                                x.Value,
                                originalFollowedUsers[x.Key].FollowSecret
                            )
                )
            )
        )
            .Where(x => !invalidFollowSecrets.Contains(x.FollowSecret))
            .ToImmutableList();
        dispatcher.Dispatch(new ReplaceFeedFollowedUsersAction(newUsers));

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
    public async Task HandlePublishWorkoutToFeedAction(
        PublishWorkoutToFeedAction action,
        IDispatcher dispatcher
    )
    {
        if (state.Value.Identity is not { PublishWorkouts: true })
        {
            return;
        }
        var (encryptedPayload, iv) = await encryptionService.SignRsa256PssAndEncryptAesCbcAsync(
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
            state.Value.Identity.AesKey,
            state.Value.Identity.RsaKeyPair.PrivateKey
        );
        await feedApiService.PutUserEventAsync(
            new PutUserEventRequest(
                UserId: state.Value.Identity.Id,
                Password: state.Value.Identity.Password,
                EncryptedEventPayload: encryptedPayload,
                EncryptedEventIV: iv.Value,
                Expiry: DateTimeOffset.UtcNow.AddDays(90)
            )
        );
    }

    [EffectMethod]
    public Task ReplaceFeedItems(ReplaceFeedItemsAction action, IDispatcher dispatcher)
    {
        return PersistFeedState();
    }

    private async ValueTask<FeedItem?> ToFeedItemAsync(UserEventResponse userEvent)
    {
        var userId = userEvent.UserId;
        var encryptedPayload = userEvent.EncryptedEventPayload;
        var payload = await DecryptUserEventPayloadAsync(
            userId,
            new AesIV(userEvent.EncryptedEventIV),
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

    private async ValueTask<UserEventPayload?> DecryptUserEventPayloadAsync(
        Guid userId,
        AesIV iv,
        byte[] encryptedPayload
    )
    {
        var user = state.Value.FollowedUsers[userId];
        var key = user.AesKey;
        var publicKey = user.PublicKey;
        if (key is null)
        {
            return null;
        }
        byte[] decrypted;
        try
        {
            decrypted = await encryptionService.DecryptAesCbcAndVerifyRsa256PssAsync(
                new AesEncryptedAndRsaSignedData(encryptedPayload, iv),
                key,
                publicKey
            );
        }
        catch (Exception e)
        {
            logger.LogError(e, "Failed to decrypt feed item. Skipping.");
            return null;
        }
        return UserEventPayload.Parser.ParseFrom(decrypted);
    }
}
