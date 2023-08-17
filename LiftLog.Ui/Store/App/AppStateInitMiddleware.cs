using Fluxor;
using LiftLog.Ui.Services;

namespace LiftLog.Ui.Store.App;

public class AppStatInitMiddleware : Middleware
{
    private readonly ProTokenRepository proTokenRepository;

    public AppStatInitMiddleware(ProTokenRepository proTokenRepository)
    {
        this.proTokenRepository = proTokenRepository;
    }

    public override async Task InitializeAsync(IDispatcher dispatch, IStore store)
    {
        var proToken = await proTokenRepository.GetProTokenAsync();

        dispatch.Dispatch(new SetProTokenAction(proToken));
    }
}
