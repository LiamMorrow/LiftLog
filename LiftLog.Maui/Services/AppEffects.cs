using Fluxor;
using LiftLog.Ui.Services;
using LiftLog.Ui.Store.App;

namespace LiftLog.Maui.Services;

public class AppEffects()
{
    [EffectMethod]
    public async Task HandleOpenExternalUrlAction(
        OpenExternalUrlAction action,
        Fluxor.IDispatcher _
    )
    {
        await Browser.Default.OpenAsync(action.Url, BrowserLaunchMode.External);
    }
}
