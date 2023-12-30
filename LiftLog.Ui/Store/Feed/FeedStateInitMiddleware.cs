using Fluxor;
using LiftLog.Ui.Models;
using LiftLog.Ui.Services;

namespace LiftLog.Ui.Store.Feed;

public class FeedStateInitMiddleware(IKeyValueStore keyValueStore) : Middleware
{
    private static readonly string Key = "FeedState";

    public override async Task InitializeAsync(IDispatcher dispatch, IStore store)
    {
        var state = await keyValueStore.GetItemBytesAsync(Key);
        if (state is not null)
        {
            var version = await keyValueStore.GetItemAsync($"{Key}Version");
            if (version is null or "1")
            {
                FeedStateDaoV1 feedState = FeedStateDaoV1.Parser.ParseFrom(state);
                if (feedState is not null)
                {
                    store.Features[nameof(FeedFeature)].RestoreState((FeedState)feedState);
                }
            }
        }
    }
}
