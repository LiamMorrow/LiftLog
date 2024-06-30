using Fluxor;
using Google.Protobuf;
using LiftLog.Ui.Models;
using LiftLog.Ui.Services;
using Microsoft.Extensions.Logging;

namespace LiftLog.Ui.Store.Feed;

public class FeedStateInitMiddleware(
    IKeyValueStore keyValueStore,
    ILogger<FeedStateInitMiddleware> logger
) : Middleware
{
    public static readonly string StorageKey = "FeedState";
    private FeedState? prevState;
    private IStore? store;

    public override async Task InitializeAsync(IDispatcher dispatch, IStore store)
    {
        this.store = store;
        try
        {
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
            if (((FeedState)store.Features[nameof(FeedFeature)].GetState()) is { Identity: null })
            {
                dispatch.Dispatch(
                    new CreateFeedIdentityAction(
                        Name: null,
                        ProfilePicture: null,
                        PublishBodyweight: false,
                        PublishPlan: false,
                        PublishWorkouts: false,
                        RedirectAfterCreation: null
                    )
                );
            }
        }
        catch (Exception e)
        {
            logger.LogError(e, "Failed to initialize feed state");
            throw;
        }
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
