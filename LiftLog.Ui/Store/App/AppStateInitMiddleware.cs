using Fluxor;
using LiftLog.Ui.Services;

namespace LiftLog.Ui.Store.App;

public class AppStateInitMiddleware(PreferencesRepository preferencesRepository) : Middleware
{
    public override async Task InitializeAsync(IDispatcher dispatch, IStore store)
    {
#if TEST_MODE
        await Task.Yield();
#else
        var proToken = await preferencesRepository.GetProTokenAsync();

        dispatch.Dispatch(new SetProTokenAction(proToken));
#endif
        var useImperialUnits = await preferencesRepository.GetUseImperialUnitsAsync();
        dispatch.Dispatch(new SetUseImperialUnitsAction(useImperialUnits));
        var showBodyweight = await preferencesRepository.GetShowBodyweightAsync();
        dispatch.Dispatch(new SetShowBodyweightAction(showBodyweight));
    }
}
