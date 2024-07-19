using Fluxor;
using LiftLog.Ui.Store.App;
using Plugin.Maui.AppRating;

namespace LiftLog.Maui.Services;

public class AppRatingEffects(IAppRating appRating)
{
    [EffectMethod]
    public async Task HandleRequestReviewAction(RequestReviewAction action, Fluxor.IDispatcher _)
    {
        await (
            Microsoft
                .Maui.Dispatching.Dispatcher.GetForCurrentThread()
                ?.DispatchAsync(async () =>
                {
# if DEBUG
                    await appRating.PerformInAppRateAsync(true);
#else
                    await appRating.PerformInAppRateAsync();
#endif
                }) ?? Task.CompletedTask
        );
    }
}
