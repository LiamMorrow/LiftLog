using Fluxor;
using LiftLog.Lib.Store;

namespace LiftLog.WebUi.Store.CurrentSession;

public class CurrentSessionEffects
{
    private readonly IProgressStore _progressStore;
    private readonly IState<CurrentSessionState> _state;

    public CurrentSessionEffects(IProgressStore progressStore, IState<CurrentSessionState> state)
    {
        _progressStore = progressStore;
        _state = state;
    }

    [EffectMethod]
    public async Task PersistCurrentSession(PersistCurrentSessionAction _, IDispatcher dispatcher)
    {
        if (_state.Value.Session is not null)
            await _progressStore.SaveCompletedSessionAsync(_state.Value.Session);
    }
}