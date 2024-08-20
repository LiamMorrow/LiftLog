using System.Collections.Immutable;
using Fluxor;

namespace LiftLog.Ui.Store.Feed;

public static class FeedReducers
{
    [ReducerMethod]
    public static FeedState SetIsHydrated(FeedState state, SetFeedIsHydratedAction action) =>
        state with
        {
            IsHydrated = true,
        };

    [ReducerMethod]
    public static FeedState PutFeedIdentity(FeedState state, PutFeedIdentityAction action) =>
        state with
        {
            Identity = action.Identity,
        };

    [ReducerMethod]
    public static FeedState ReplaceFeedItems(FeedState state, ReplaceFeedItemsAction action) =>
        state with
        {
            Feed = action.Items,
        };

    [ReducerMethod]
    public static FeedState PutFeedUser(FeedState state, PutFollowedUsersAction action) =>
        state with
        {
            FollowedUsers = state.FollowedUsers.SetItem(action.User.Id, action.User),
        };

    [ReducerMethod]
    public static FeedState SetSharedFeedUser(FeedState state, SetSharedFeedUserAction action) =>
        state with
        {
            SharedFeedUser = action.User,
        };

    [ReducerMethod]
    public static FeedState SaveSharedFeedUser(FeedState state, SaveSharedFeedUserAction _) =>
        !state.SharedFeedUser.IsSuccess
            ? state
            : state with
            {
                FollowedUsers = state.FollowedUsers.SetItem(
                    state.SharedFeedUser.Data.Id,
                    state.SharedFeedUser.Data
                ),
                SharedFeedUser = RemoteData.NotAsked,
            };

    [ReducerMethod]
    public static FeedState ReplaceFeedUsers(
        FeedState state,
        ReplaceFeedFollowedUsersAction action
    ) => state with { FollowedUsers = action.FollowedUsers.ToImmutableDictionary(x => x.Id) };

    [ReducerMethod]
    public static FeedState DeleteFeedUser(FeedState state, UnfollowFeedUserAction action) =>
        state with
        {
            FollowedUsers = state.FollowedUsers.Remove(action.FeedUser.Id),
            Feed = state.Feed.Where(x => x.UserId != action.FeedUser.Id).ToImmutableList(),
        };

    [ReducerMethod]
    public static FeedState SetIsLoadingIdentity(
        FeedState state,
        SetIsLoadingIdentityAction action
    ) => state with { IsLoadingIdentity = action.IsLoadingIdentity };

    [ReducerMethod]
    public static FeedState AppendNewFollowRequests(
        FeedState state,
        AppendNewFollowRequestsAction action
    ) =>
        state with
        {
            FollowRequests = state
                .FollowRequests.Concat(action.Requests)
                .DistinctBy(x => x.UserId)
                .ToImmutableList(),
        };

    [ReducerMethod]
    public static FeedState RemoveFollowRequest(
        FeedState state,
        RemoveFollowRequestAction action
    ) => state with { FollowRequests = state.FollowRequests.Remove(action.Request) };

    [ReducerMethod]
    public static FeedState AddFollower(FeedState state, AddFollowerAction action) =>
        state with
        {
            Followers = state.Followers.SetItem(action.User.Id, action.User),
        };

    [ReducerMethod]
    public static FeedState RemoveFollower(FeedState state, RemoveFollowerAction action) =>
        state with
        {
            Followers = state.Followers.Remove(action.User.Id),
        };

    [ReducerMethod]
    public static FeedState SetActiveTab(FeedState state, SetActiveTabAction action) =>
        state with
        {
            ActiveTab = action.TabId,
        };

    [ReducerMethod]
    public static FeedState AddUnpublishedSessionId(
        FeedState state,
        AddUnpublishedSessionIdAction action
    ) =>
        state is { Identity.PublishWorkouts: true }
            ? state with
            {
                UnpublishedSessionIds = state.UnpublishedSessionIds.Add(action.SessionId),
            }
            : state;

    [ReducerMethod]
    public static FeedState RemoveUnpublishedSessionId(
        FeedState state,
        RemoveUnpublishedSessionIdAction action
    ) =>
        state with
        {
            UnpublishedSessionIds = state.UnpublishedSessionIds.Remove(action.SessionId),
        };

    [ReducerMethod]
    public static FeedState SetSharedItem(FeedState state, SetSharedItemAction action) =>
        state with
        {
            SharedItem = action.SharedItem,
        };

    [ReducerMethod]
    public static FeedState SetFeedState(FeedState state, SetFeedStateAction action) =>
        action.FeedState;
}
