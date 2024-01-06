using System.Collections.Immutable;
using Fluxor;

namespace LiftLog.Ui.Store.Feed;

public class FeedFeature : Feature<FeedState>
{
    public override string GetName() => nameof(FeedFeature);

    protected override FeedState GetInitialState() =>
        new(
            IsLoadingIdentity: false,
            Identity: null,
            Feed: [],
            Users: ImmutableDictionary<Guid, FeedUser>.Empty,
            SharedFeedUser: null,
            FollowRequests: []
        );
}
