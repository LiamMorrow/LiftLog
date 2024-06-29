using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.Feed;

public record SetFeedIsHydratedAction();

public record CreateFeedIdentityAction(
    Guid Id,
    string? Name,
    byte[]? ProfilePicture,
    bool PublishBodyweight,
    bool PublishPlan,
    bool PublishWorkouts,
    string? RedirectAfterCreation
);

public record UpdateFeedIdentityAction(
    string? Name,
    byte[]? ProfilePicture,
    bool PublishBodyweight,
    bool PublishPlan,
    bool PublishWorkouts
);

public record PutFeedIdentityAction(FeedIdentity? Identity);

public record ReplaceFeedItemsAction(ImmutableListValue<FeedItem> Items);

public record DeleteFeedIdentityAction();

public record RequestFollowUserAction();

public record FetchInboxItemsAction();

public record PutFollowedUsersAction(FeedUser User);

public record SetSharedFeedUserAction(FeedUser? User);

public record FetchAndSetSharedFeedUserAction(
    string IdOrLookup,
    string? Name,
    byte[]? RsaPublicKey
);

public record PublishIdentityIfEnabledAction();

public record SaveSharedFeedUserAction();

public record FetchSessionFeedItemsAction();

public record PublishUnpublishedSessionsAction();

public record GetLookupIfNeededAction();

public record ReplaceFeedFollowedUsersAction(ImmutableListValue<FeedUser> FollowedUsers);

public record UnfollowFeedUserAction(FeedUser FeedUser);

public record SetIsLoadingIdentityAction(bool IsLoadingIdentity);

public record AppendNewFollowRequestsAction(ImmutableListValue<FollowRequest> Requests);

public record ProcessFollowResponsesAction(ImmutableListValue<FollowResponse> Responses);

public record DenyFollowRequestAction(FollowRequest Request);

public record RemoveFollowRequestAction(FollowRequest Request);

public record AcceptFollowRequestAction(FollowRequest Request);

public record AddFollowerAction(FeedUser User);

public record StartRemoveFollowerAction(FeedUser User);

public record RemoveFollowerAction(FeedUser User);

public record SetActiveTabAction(string TabId);

public record AddUnpublishedSessionIdAction(Guid SessionId);

public record RemoveUnpublishedSessionIdAction(Guid SessionId);
