using System.Collections.Immutable;
using Fluxor;
using Google.Protobuf;
using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Lib.Services;
using LiftLog.Ui.Models;
using LiftLog.Ui.Models.SessionHistoryDao;
using Microsoft.Extensions.Logging;
using static LiftLog.Ui.Models.UserEventPayload;

namespace LiftLog.Ui.Store.Feed;

public partial class FeedEffects
{
    [EffectMethod]
    public async Task HandleFetchInboxItemsAction(
        FetchInboxItemsAction action,
        IDispatcher dispatcher
    )
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
            dispatcher.Dispatch(
                new FeedApiErrorAction(
                    "Failed to fetch inbox items",
                    inboxItemsResponse.Error,
                    action
                )
            );
            return;
        }

        var encryptedInboxItems = inboxItemsResponse.Data.InboxMessages;
        var inboxItems = (
            await Task.WhenAll(
                encryptedInboxItems.Select(x =>
                    feedInboxDecryptionService.DecryptIfValid(identity, x)
                )
            )
        ).WhereNotNull();

        var newFollowRequests = inboxItems
            .Where(x =>
                x.MessagePayloadCase == InboxMessageDao.MessagePayloadOneofCase.FollowRequest
            )
            .Select(x => new FollowRequest(UserId: x.FromUserId, x.FollowRequest.Name))
            .ToImmutableList();
        dispatcher.Dispatch(new AppendNewFollowRequestsAction(newFollowRequests));

        var newFollowResponses = inboxItems
            .Where(x =>
                x.MessagePayloadCase == InboxMessageDao.MessagePayloadOneofCase.FollowResponse
            )
            .Select(x => new FollowResponse(
                UserId: x.FromUserId,
                Accepted: x.FollowResponse.ResponsePayloadCase
                    == FollowResponseDao.ResponsePayloadOneofCase.Accepted,
                AesKey: x.FollowResponse.ResponsePayloadCase
                == FollowResponseDao.ResponsePayloadOneofCase.Accepted
                    ? new AesKey(x.FollowResponse.Accepted.AesKey.ToByteArray())
                    : null,
                FollowSecret: x.FollowResponse.ResponsePayloadCase
                == FollowResponseDao.ResponsePayloadOneofCase.Accepted
                    ? x.FollowResponse.Accepted.FollowSecret
                    : null
            ))
            .ToImmutableList();

        dispatcher.Dispatch(new ProcessFollowResponsesAction(newFollowResponses));

        var followers = state.Value.Followers;
        var unfollowNotifications = inboxItems
            .Where(x =>
                x.MessagePayloadCase == InboxMessageDao.MessagePayloadOneofCase.UnfollowNotification
            )
            .SelectMany(x =>
                followers.Values.Where(f =>
                    f.Id == x.FromUserId && f.FollowSecret == x.UnfollowNotification.FollowSecret
                )
            );

        foreach (var unfollowNotification in unfollowNotifications)
        {
            dispatcher.Dispatch(new RemoveFollowerAction(unfollowNotification));
        }
    }
}
