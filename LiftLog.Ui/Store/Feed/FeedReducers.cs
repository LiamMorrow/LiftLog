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
}
