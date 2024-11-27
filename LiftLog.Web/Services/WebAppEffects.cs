using Fluxor;
using LiftLog.Ui.Services;
using LiftLog.Ui.Store.App;

namespace LiftLog.Web.Services;

public class WebAppEffects(NavigationManagerProvider navigationManagerProvider)
{
    [EffectMethod]
    public async Task HandleOpenExternalUrlAction(OpenExternalUrlAction action, IDispatcher _)
    {
        var navigationManager = await navigationManagerProvider.GetNavigationManager();
        navigationManager.NavigateTo(action.Url, true);
    }
}
