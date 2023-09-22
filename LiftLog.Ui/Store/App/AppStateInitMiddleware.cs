using Fluxor;
using LiftLog.Ui.Services;

namespace LiftLog.Ui.Store.App;

public class AppStateInitMiddleware : Middleware
{
    private readonly ProTokenRepository proTokenRepository;

    public AppStateInitMiddleware(ProTokenRepository proTokenRepository)
    {
        this.proTokenRepository = proTokenRepository;
    }

    public override async Task InitializeAsync(IDispatcher dispatch, IStore store)
    {
#if TEST_MODE
        await Task.Yield();
#else
        var proToken = await proTokenRepository.GetProTokenAsync();

        dispatch.Dispatch(new SetProTokenAction("102bc25a-f46b-4423-9149-b0fa39b32f1e"));
#endif
    }
}
