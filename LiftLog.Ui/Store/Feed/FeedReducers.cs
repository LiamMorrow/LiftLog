using System.Collections.Immutable;
using Fluxor;

namespace LiftLog.Ui.Store.Feed;

public static class FeedReducers
{
    [ReducerMethod]
    public static FeedState PutFeedIdentity(FeedState state, PutFeedIdentityAction action) =>
        state with
        {
            Identity = action.Identity
        };

    [ReducerMethod]
    public static FeedState ReplaceFeedItems(FeedState state, ReplaceFeedItemsAction action) =>
        state with
        {
            Feed = action.Items
        };

    [ReducerMethod]
    public static FeedState PutFeedUser(FeedState state, PutFeedUserAction action) =>
        state with
        {
            Users = state.Users.SetItem(action.User.Id, action.User)
        };

    [ReducerMethod]
    public static FeedState SetSharedFeedUser(FeedState state, SetSharedFeedUserAction action) =>
        state with
        {
            SharedFeedUser = action.User
        };

    [ReducerMethod]
    public static FeedState SaveSharedFeedUser(FeedState state, SaveSharedFeedUserAction _) =>
        state.SharedFeedUser is null
            ? state
            : state with
            {
                Users = state.Users.SetItem(state.SharedFeedUser.Id, state.SharedFeedUser),
                SharedFeedUser = null
            };

    [ReducerMethod]
    public static FeedState ReplaceFeedUsers(FeedState state, ReplaceFeedUsersAction action) =>
        state with
        {
            Users = action.Users.ToImmutableDictionary(x => x.Id)
        };

    [ReducerMethod]
    public static FeedState DeleteFeedUser(FeedState state, DeleteFeedUserAction action) =>
        state with
        {
            Users = state.Users.Remove(action.FeedUser.Id),
            Feed = state.Feed.Where(x => x.UserId != action.FeedUser.Id).ToImmutableList()
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
                .ToImmutableList()
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
            Followers = state.Followers.Add(action.User).DistinctBy(x => x.Id).ToImmutableList()
        };

    [ReducerMethod]
    public static FeedState RemoveFollower(FeedState state, RemoveFollowerAction action) =>
        state with
        {
            Followers = state.Followers.Remove(action.User)
        };

    [ReducerMethod]
    public static FeedState SetActiveTab(FeedState state, SetActiveTabAction action) =>
        state with
        {
            ActiveTab = action.TabId
        };
}
