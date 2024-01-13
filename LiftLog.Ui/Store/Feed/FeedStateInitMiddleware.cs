using Fluxor;
using Google.Protobuf;
using LiftLog.Ui.Models;
using LiftLog.Ui.Services;

namespace LiftLog.Ui.Store.Feed;

public class FeedStateInitMiddleware(IKeyValueStore keyValueStore) : Middleware
{
    public static readonly string StorageKey = "FeedState";
    private FeedState? prevState;
    private IStore? store;

    public override async Task InitializeAsync(IDispatcher dispatch, IStore store)
    {
        this.store = store;
        var state = await keyValueStore.GetItemBytesAsync(StorageKey);
        if (state is not null)
        {
            var version = await keyValueStore.GetItemAsync($"{StorageKey}Version");
            if (version is null or "1")
            {
                FeedStateDaoV1 feedState = FeedStateDaoV1.Parser.ParseFrom(state);
                if (feedState is not null)
                {
                    store.Features[nameof(FeedFeature)].RestoreState((FeedState)feedState);
                }
            }
        }
        dispatch.Dispatch(new SetFeedIsHydratedAction());
    }

    public override void AfterDispatch(object action)
    {
        base.AfterDispatch(action);
        var state = (FeedState?)store?.Features[nameof(FeedFeature)].GetState();
        if (state is null)
        {
            return;
        }
        if (prevState is not null && prevState.Equals(state))
        {
            return;
        }
        prevState = state;
        _ = Task.Run(async () =>
        {
            await keyValueStore.SetItemAsync($"{StorageKey}Version", "1");
            await keyValueStore.SetItemAsync(StorageKey, ((FeedStateDaoV1)state).ToByteArray());
        });
    }
}
