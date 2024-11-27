using Fluxor;
using LiftLog.Ui.Services;
using LiftLog.Ui.Store.App;

namespace LiftLog.Maui.Services;

public class AppEffects()
{
    [EffectMethod]
    public async Task HandleOpenExternalUrlAction(
        OpenExternalUrlAction action,
        Fluxor.IDispatcher dispatcher
    )
    {
#if IOS
        await Browser.Default.OpenAsync(action.Url, BrowserLaunchMode.External);
#elif ANDROID
        // For whatever reason, adding queries to the manifest did not work on real devices, however we already have the capability to open external URLs
        // with the NavigateAction
        dispatcher.Dispatch(new NavigateAction(action.Url));
        await Task.CompletedTask;
#endif
    }
}
