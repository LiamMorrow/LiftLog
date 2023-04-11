using Fluxor;
using LiftLog.Lib.Store;

namespace LiftLog.WebUi.Store.Program;

public class PersistProgramMiddleware : Middleware
{
    private readonly IProgramStore _programStore;
    private IStore? _store;

    public PersistProgramMiddleware(IProgramStore programStore)
    {
        _programStore = programStore;
    }

    public override async Task InitializeAsync(IDispatcher dispatch, IStore store)
    {
        _store = store;
        var programs = await _programStore.GetSessionsInProgramAsync();
        store.Features[nameof(ProgramFeature)].RestoreState(
            new ProgramState(programs)
        );

        dispatch.Dispatch(new RehydrateProgramAction());
    }

    public override void AfterDispatch(object action)
    {
        var currentState = (ProgramState?)_store?.Features[nameof(ProgramFeature)].GetState();
        if (currentState?.SessionBlueprints is null)
        {
            return;
        }

        _programStore.PersistSessionsInProgramAsync(currentState.SessionBlueprints);
    }
}
