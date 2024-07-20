using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Lib.Services;
using LiftLog.Ui.Services;

namespace LiftLog.Ui.Store.Feed;

public record SetFeedIsHydratedAction();

public abstract record FeedApiAction(bool FromUserAction);

public record CreateFeedIdentityAction(
    string? Name,
    byte[]? ProfilePicture,
    bool PublishBodyweight,
    bool PublishPlan,
    bool PublishWorkouts,
    bool FromUserAction
) : FeedApiAction(FromUserAction);

public record UpdateFeedIdentityAction(
    string? Name,
    byte[]? ProfilePicture,
    bool PublishBodyweight,
    bool PublishPlan,
    bool PublishWorkouts,
    bool FromUserAction
) : FeedApiAction(FromUserAction);

public record PutFeedIdentityAction(FeedIdentity? Identity);

public record ReplaceFeedItemsAction(ImmutableListValue<FeedItem> Items);

public record DeleteFeedIdentityAction() : FeedApiAction(FromUserAction: true);

public record RequestFollowUserAction() : FeedApiAction(FromUserAction: true);

public record FetchInboxItemsAction(bool FromUserAction) : FeedApiAction(FromUserAction);

public record PutFollowedUsersAction(FeedUser User);

public record SetSharedFeedUserAction(RemoteData<FeedUser> User);

public record SetFeedStateAction(FeedState FeedState);

public record FeedApiErrorAction(string Message, ApiError ApiError, FeedApiAction Action);

public record FetchAndSetSharedFeedUserAction(string IdOrLookup, string? Name)
    : FeedApiAction(FromUserAction: true);

public record PublishIdentityIfEnabledAction() : FeedApiAction(FromUserAction: false);

public record SaveSharedFeedUserAction();

public record FetchSessionFeedItemsAction(bool FromUserAction) : FeedApiAction(FromUserAction);

public record PublishUnpublishedSessionsAction();

public record ReplaceFeedFollowedUsersAction(ImmutableListValue<FeedUser> FollowedUsers);

public record UnfollowFeedUserAction(FeedUser FeedUser);

public record SetIsLoadingIdentityAction(bool IsLoadingIdentity);

public record AppendNewFollowRequestsAction(ImmutableListValue<FollowRequest> Requests);

public record ProcessFollowResponsesAction(ImmutableListValue<FollowResponse> Responses);

public record DenyFollowRequestAction(FollowRequest Request);

public record RemoveFollowRequestAction(FollowRequest Request);

public record AcceptFollowRequestAction(FollowRequest Request)
    : FeedApiAction(FromUserAction: true);

public record AddFollowerAction(FeedUser User);

public record StartRemoveFollowerAction(FeedUser User) : FeedApiAction(FromUserAction: true);

public record RemoveFollowerAction(FeedUser User);

public record SetActiveTabAction(string TabId);

public record AddUnpublishedSessionIdAction(Guid SessionId);

public record RemoveUnpublishedSessionIdAction(Guid SessionId);

public record EncryptAndShareAction(SharedItem SharedItem);

public record SetSharedItemAction(RemoteData<SharedItem> SharedItem);

public record FetchSharedItemAction(string Id, AesKey AesKey);
