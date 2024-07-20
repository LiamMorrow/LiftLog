using System.Collections.Immutable;
using Fluxor;

namespace LiftLog.Ui.Store.Feed;

public class FeedFeature : Feature<FeedState>
{
    public override string GetName() => nameof(FeedFeature);

    protected override FeedState GetInitialState() =>
        new(
            IsHydrated: false,
            IsLoadingIdentity: false,
            Identity: null,
            Feed: [],
            FollowedUsers: ImmutableDictionary<Guid, FeedUser>.Empty,
            SharedFeedUser: RemoteData.NotAsked,
            FollowRequests: [],
            Followers: ImmutableDictionary<Guid, FeedUser>.Empty,
            ActiveTab: "mainfeed-panel",
            UnpublishedSessionIds: [],
            SharedItem: RemoteData.NotAsked
        );
}
