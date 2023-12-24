using Fluxor;
using LiftLog.Ui.Services;
using Microsoft.AspNetCore.Components;

namespace LiftLog.Ui.Store.Settings;

public class SettingsStateInitMiddleware(PreferencesRepository preferencesRepository) : Middleware
{
    public override async Task InitializeAsync(IDispatcher dispatch, IStore store)
    {
        var useImperialUnits = await preferencesRepository.GetUseImperialUnitsAsync();
        dispatch.Dispatch(new SetUseImperialUnitsAction(useImperialUnits));
        var showBodyweight = await preferencesRepository.GetShowBodyweightAsync();
        dispatch.Dispatch(new SetShowBodyweightAction(showBodyweight));
    }
}
