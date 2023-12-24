using Fluxor;
using LiftLog.Ui.Services;
using Microsoft.AspNetCore.Components;

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
    }
}
