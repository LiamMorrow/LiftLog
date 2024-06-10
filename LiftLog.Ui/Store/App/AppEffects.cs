using Fluxor;
using LiftLog.Ui.Services;

namespace LiftLog.Ui.Store.App;

public class AppEffects(
    PreferencesRepository preferencesRepository,
    NavigationManagerProvider navigationManagerProvider
)
{
    [EffectMethod]
    public async Task HandleSetProTokenAction(SetProTokenAction action, IDispatcher dispatcher)
    {
        await preferencesRepository.SetProTokenAsync(action.ProToken);
    }

    [EffectMethod]
    public async Task HandleNavigateAction(NavigateAction action, IDispatcher dispatcher)
    {
        if (action.ClearPageStack)
        {
            dispatcher.Dispatch(new SetLatestSettingsUrlAction(null));
        }

        var navigationManager = await navigationManagerProvider.GetNavigationManager();
        if (
            action.IfCurrentPathMatches is not null
            && !action.IfCurrentPathMatches.IsMatch(navigationManager.Uri)
        )
        {
            return;
        }
        navigationManager.NavigateTo(action.Path);
    }
}
