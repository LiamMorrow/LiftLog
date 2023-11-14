using Fluxor;
using LiftLog.Ui.Services;

namespace LiftLog.Ui.Store.App;

public class AppEffects
{
    private readonly PreferencesRepository preferencesRepository;

    public AppEffects(PreferencesRepository preferencesRepository)
    {
        this.preferencesRepository = preferencesRepository;
    }

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
}
