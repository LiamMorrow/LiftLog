using System.Collections.Immutable;
using System.Text;
using Fluxor;
using Google.Protobuf;
using LiftLog.Lib.Models;
using LiftLog.Lib.Services;
using LiftLog.Ui.Models;
using LiftLog.Ui.Models.SessionHistoryDao;
using LiftLog.Ui.Services;
using Microsoft.Extensions.Logging;
using static LiftLog.Ui.Models.UserEventPayload;

namespace LiftLog.Ui.Store.Feed;

public partial class FeedEffects
{
    private static readonly DateTimeOffset MinTimestamp = DateTimeOffset.Parse(
        "2000-01-01T00:00:00Z"
    );

    [EffectMethod]
    public async Task HandleFetchSessionFeedItemsAction(
        FetchSessionFeedItemsAction action,
        IDispatcher dispatcher
    )
    {
        var originalFollowedUsers = state.Value.FollowedUsers;
        var userIdToLatestEvent = state
            .Value.Feed.GroupBy(x => x.UserId)
            .ToDictionary(x => x.Key, x => x.Max(x => x.Timestamp));
        var followedUsersWithFollowSecret = originalFollowedUsers
            .Where(x => x.Value.FollowSecret is not null)
            .Select(x => new GetUserEventRequest(
                UserId: x.Key,
                FollowSecret: x.Value.FollowSecret!,
                Since: userIdToLatestEvent.GetValueOrDefault(x.Key, MinTimestamp)
            ));
        if (!followedUsersWithFollowSecret.Any())
        {
            return;
        }

        var feedResponseTask = feedApiService.GetUserEventsAsync(
            new GetEventsRequest(Users: [.. followedUsersWithFollowSecret])
        );
        var userResponseTask = feedApiService.GetUsersAsync(
            new GetUsersRequest(followedUsersWithFollowSecret.Select(x => x.UserId).ToArray())
        );

        var (feedResponse, usersResponse) = await (feedResponseTask, userResponseTask);
        if (!feedResponse.IsSuccess)
        {
            dispatcher.Dispatch(
                new FeedApiErrorAction("Failed to fetch feed items", feedResponse.Error, action)
            );
            return;
        }

        if (!usersResponse.IsSuccess)
        {
            dispatcher.Dispatch(
                new FeedApiErrorAction("Failed to fetch users", usersResponse.Error, action)
            );
            return;
        }

        var feedEvents = feedResponse.Data.Events;
        var invalidFollowSecrets = feedResponse.Data.InvalidFollowSecrets;
        var users = usersResponse.Data.Users;

        var newUsers = (
            await Task.WhenAll(
                users.Select(async x =>
                    originalFollowedUsers[x.Key].AesKey is null
                        ? ((FeedUser?)originalFollowedUsers[x.Key])
                        : (
                            await GetDecryptedUserAsync(
                                x.Key,
                                originalFollowedUsers[x.Key].PublicKey,
                                originalFollowedUsers[x.Key].AesKey!,
                                originalFollowedUsers[x.Key].Nickname,
                                x.Value,
                                originalFollowedUsers[x.Key].FollowSecret
                            )
                        ) ?? originalFollowedUsers[x.Key]
                )
            )
        )
            .WhereNotNull()
            .Concat(
                state
                    .Value.FollowedUsers.Where(x => x.Value.FollowSecret is null)
                    .Select(x => x.Value)
            )
            .Where(x => !invalidFollowSecrets.Contains(x.FollowSecret))
            .ToImmutableList();
        dispatcher.Dispatch(new ReplaceFeedFollowedUsersAction(newUsers));

        var feedItems = (
            await Task.WhenAll(
                feedEvents
                    .Where(ev => newUsers.Any(us => us.Id == ev.UserId))
                    .Select(x => ToFeedItemAsync(x))
            )
        ).WhereNotNull();

        var now = DateTimeOffset.UtcNow;
        dispatcher.Dispatch(
            new ReplaceFeedItemsAction(
                state
                    .Value.Feed.Concat(feedItems)
                    .Where(x => x.Expiry >= now)
                    .Where(ev => newUsers.Any(us => us.Id == ev.UserId))
                    .GroupBy(x => (x.UserId, x.EventId))
                    .Select(x => x.OrderByDescending(x => x.Timestamp).First())
                    .OrderByDescending(x =>
                        x is SessionFeedItem sessionFeedItem
                            ? sessionFeedItem.Session.Date.ToDateTime(
                                TimeOnly.MinValue,
                                DateTimeKind.Local
                            )
                            : x.Timestamp
                    )
                    .ThenByDescending(x => x.Timestamp)
                    .Where(x => x is not RemovedSessionFeedItem)
                    .ToImmutableList()
            )
        );
    }

    [EffectMethod]
    public async Task HandlePublishUnpublishedSessionsAction(
        PublishUnpublishedSessionsAction action,
        IDispatcher dispatcher
    )
    {
        if (state.Value.Identity is not { PublishWorkouts: true })
        {
            return;
        }

        var unpublishedSessionIds = state.Value.UnpublishedSessionIds;
        foreach (var sessionId in unpublishedSessionIds)
        {
            var session = await progressRepository.GetSessionAsync(sessionId);
            if (session is not null)
            {
                var result = await PublishSessionAsync(state.Value.Identity, session);
                if (!result.IsSuccess)
                {
                    continue;
                }
            }
            else
            {
                var result = await RemovePublishedSessionAsync(state.Value.Identity, sessionId);
                if (!result.IsSuccess)
                {
                    continue;
                }
            }

            dispatcher.Dispatch(new RemoveUnpublishedSessionIdAction(sessionId));
        }
    }

    private async Task<ApiResult> PublishSessionAsync(FeedIdentity identity, Session session)
    {
        var (encryptedPayload, iv) = await encryptionService.SignRsa256PssAndEncryptAesCbcAsync(
            new UserEventPayload
            {
                SessionPayload = new SessionUserEvent
                {
                    Session = SessionDaoV2.FromModel(
                        session with
                        {
                            Bodyweight = identity.PublishBodyweight ? session.Bodyweight : null,
                        }
                    ),
                },
            }.ToByteArray(),
            identity.AesKey,
            identity.RsaKeyPair.PrivateKey
        );
        return await feedApiService.PutUserEventAsync(
            new PutUserEventRequest(
                UserId: identity.Id,
                Password: identity.Password,
                EventId: session.Id,
                EncryptedEventPayload: encryptedPayload,
                EncryptedEventIV: iv.Value,
                Expiry: DateTimeOffset.UtcNow.AddDays(90)
            )
        );
    }

    private async Task<ApiResult> RemovePublishedSessionAsync(FeedIdentity identity, Guid sessionId)
    {
        var (encryptedPayload, iv) = await encryptionService.SignRsa256PssAndEncryptAesCbcAsync(
            new UserEventPayload
            {
                RemovedSessionPayload = new RemovedSessionUserEvent { SessionId = sessionId },
            }.ToByteArray(),
            identity.AesKey,
            identity.RsaKeyPair.PrivateKey
        );
        return await feedApiService.PutUserEventAsync(
            new PutUserEventRequest(
                UserId: identity.Id,
                Password: identity.Password,
                EventId: sessionId,
                EncryptedEventPayload: encryptedPayload,
                EncryptedEventIV: iv.Value,
                Expiry: DateTimeOffset.UtcNow.AddDays(90)
            )
        );
    }

    private async Task<FeedUser?> GetDecryptedUserAsync(
        Guid Id,
        RsaPublicKey publicKey,
        AesKey aesKey,
        string? nickname,
        GetUserResponse response,
        string? followSecret
    )
    {
        try
        {
            return new FeedUser(
                Id,
                PublicKey: publicKey,
                AesKey: aesKey,
                Name: response.EncryptedName is null or { Length: 0 }
                    ? null
                    : Encoding.UTF8.GetString(
                        await encryptionService.DecryptAesCbcAndVerifyRsa256PssAsync(
                            new AesEncryptedAndRsaSignedData(
                                response.EncryptedName,
                                new AesIV(response.EncryptionIV)
                            ),
                            aesKey,
                            publicKey
                        )
                    ),
                Nickname: nickname,
                CurrentPlan: response.EncryptedCurrentPlan is null or { Length: 0 }
                    ? []
                    : CurrentPlanDaoV1
                        .Parser.ParseFrom(
                            await encryptionService.DecryptAesCbcAndVerifyRsa256PssAsync(
                                new AesEncryptedAndRsaSignedData(
                                    response.EncryptedCurrentPlan,
                                    new AesIV(response.EncryptionIV)
                                ),
                                aesKey,
                                publicKey
                            )
                        )
                        .Sessions.Select(sessionBlueprintDao => sessionBlueprintDao.ToModel())
                        .ToImmutableList(),
                ProfilePicture: response.EncryptedProfilePicture is null or { Length: 0 }
                    ? null
                    : await encryptionService.DecryptAesCbcAndVerifyRsa256PssAsync(
                        new AesEncryptedAndRsaSignedData(
                            response.EncryptedProfilePicture,
                            new AesIV(response.EncryptionIV)
                        ),
                        aesKey,
                        publicKey
                    ),
                FollowSecret: followSecret
            );
        }
        catch (Exception e)
        {
            logger.LogError(e, "Failed to decrypt feed user");
            return null;
        }
    }

    private async Task<FeedItem?> ToFeedItemAsync(UserEventResponse userEvent)
    {
        var userId = userEvent.UserId;
        var encryptedPayload = userEvent.EncryptedEventPayload;
        var payload = await DecryptUserEventPayloadAsync(
            userId,
            new AesIV(userEvent.EncryptedEventIV),
            encryptedPayload
        );

        return payload switch
        {
            { EventPayloadCase: EventPayloadOneofCase.SessionPayload } => new SessionFeedItem(
                UserId: userEvent.UserId,
                EventId: userEvent.EventId,
                Timestamp: userEvent.Timestamp,
                Expiry: userEvent.Expiry,
                Session: payload.SessionPayload.Session.ToModel()
            ),
            { EventPayloadCase: EventPayloadOneofCase.RemovedSessionPayload } =>
                new RemovedSessionFeedItem(
                    UserId: userEvent.UserId,
                    EventId: userEvent.EventId,
                    Timestamp: userEvent.Timestamp,
                    Expiry: userEvent.Expiry,
                    SessionId: payload.RemovedSessionPayload.SessionId
                ),
            _ => null,
        };
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
