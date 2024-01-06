using Fluxor;
using LiftLog.Ui.Services;
using Microsoft.AspNetCore.Components;

namespace LiftLog.Ui.Store.App;

public class AppEffects(PreferencesRepository preferencesRepository)
{
    [EffectMethod]
    public async Task HandleSetProTokenAction(SetProTokenAction action, IDispatcher dispatcher)
    {
        await preferencesRepository.SetProTokenAsync(action.ProToken);
    }
}
