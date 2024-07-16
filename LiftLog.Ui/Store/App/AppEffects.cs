using Fluxor;
using LiftLog.Ui.Services;

namespace LiftLog.Ui.Store.App;

public class AppEffects(
    PreferencesRepository preferencesRepository,
    NavigationManagerProvider navigationManagerProvider,
    IState<AppState> appState
)
{
    [EffectMethod]
    public async Task HandleSetProTokenAction(SetProTokenAction action, IDispatcher dispatcher)
    {
        await preferencesRepository.SetProTokenAsync(action.ProToken);
    }

    [EffectMethod]
    public Task HandleIncrementAppLaunchCountAction(
        IncrementAppLaunchCountAction action,
        IDispatcher dispatcher
    )
    {
        if (appState.Value.AppRatingResult != AppRatingResult.NotRated)
        {
            return Task.CompletedTask;
        }
        var appLaunchCount = appState.Value.AppLaunchCount;
        appLaunchCount++;
        dispatcher.Dispatch(new SetAppLaunchCountAction(appLaunchCount));
        return Task.CompletedTask;
    }

    [EffectMethod]
    public async Task HandleSetAppRatingResultAction(SetAppRatingResultAction action, IDispatcher _)
    {
        await preferencesRepository.SetAppRatingResultAsync(action.AppRatingResult);
    }

    [EffectMethod]
    public async Task HandleSetAppLaunchCountAction(
        SetAppLaunchCountAction action,
        IDispatcher dispatcher
    )
    {
        await preferencesRepository.SetAppOpenedCountAsync(action.AppLaunchCount);
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
