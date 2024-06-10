using Fluxor;
using LiftLog.Ui.Services;
using Microsoft.AspNetCore.Components;

namespace LiftLog.Ui.Store.App;

public class AppStateInitMiddleware(PreferencesRepository preferencesRepository) : Middleware
{
    public override async Task InitializeAsync(IDispatcher dispatch, IStore store)
    {
        var proToken = await preferencesRepository.GetProTokenAsync();
#if TEST_MODE
        await Task.Yield();
#else
        dispatch.Dispatch(new SetProTokenAction(proToken));
#endif

        dispatch.Dispatch(new SetAppStateIsHydratedAction(true));
    }
}
