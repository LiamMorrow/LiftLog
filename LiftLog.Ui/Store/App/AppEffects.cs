using Fluxor;
using LiftLog.Ui.Services;
using Microsoft.AspNetCore.Components;

namespace LiftLog.Ui.Store.App;

public class AppEffects(
    PreferencesRepository preferencesRepository,
    NavigationManager navigationManager
)
{
    [EffectMethod]
    public async Task HandleSetProTokenAction(SetProTokenAction action, IDispatcher dispatcher)
    {
        await preferencesRepository.SetProTokenAsync(action.ProToken);
    }

    [EffectMethod]
    public Task HandleNavigateAction(NavigateAction action, IDispatcher dispatcher)
    {
        navigationManager.NavigateTo(action.Url);
        return Task.CompletedTask;
    }
}
