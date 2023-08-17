using Fluxor;
using LiftLog.Ui.Services;

namespace LiftLog.Ui.Store.App;

public class AppEffects
{
    private readonly ProTokenRepository proTokenRepository;

    public AppEffects(ProTokenRepository proTokenRepository)
    {
        this.proTokenRepository = proTokenRepository;
    }

    [EffectMethod]
    public async Task HandleSetProTokenAction(SetProTokenAction action, IDispatcher dispatcher)
    {
        await proTokenRepository.SetProTokenAsync(action.ProToken);
    }
}
