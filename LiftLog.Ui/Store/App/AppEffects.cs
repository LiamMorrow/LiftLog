using Fluxor;
using LiftLog.Ui.Services;

namespace LiftLog.Ui.Store.App;

public class AppEffects(PreferencesRepository preferencesRepository)
{
    [EffectMethod]
    public async Task HandleSetProTokenAction(SetProTokenAction action, IDispatcher dispatcher)
    {
        await preferencesRepository.SetProTokenAsync(action.ProToken);
    }

    [EffectMethod]
    public async Task HandleSetUseImperialUnitsAction(
        SetUseImperialUnitsAction action,
        IDispatcher dispatcher
    )
    {
        await preferencesRepository.SetUseImperialUnitsAsync(action.UseImperialUnits);
    }

    [EffectMethod]
    public async Task HandleSetShowBodyweightAction(
        SetShowBodyweightAction action,
        IDispatcher dispatcher
    )
    {
        await preferencesRepository.SetShowBodyweightAsync(action.ShowBodyweight);
    }
}
