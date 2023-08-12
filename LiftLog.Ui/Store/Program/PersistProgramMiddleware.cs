using Fluxor;
using LiftLog.Ui.Repository;

namespace LiftLog.Ui.Store.Program;

public class PersistProgramMiddleware : Middleware
{
    private readonly IProgramRepository _programRepository;
    private IStore? _store;

    public PersistProgramMiddleware(IProgramRepository programRepository)
    {
        _programRepository = programRepository;
    }

    public override async Task InitializeAsync(IDispatcher dispatch, IStore store)
    {
        _store = store;
        var programs = await _programRepository.GetSessionsInProgramAsync();
        store.Features[nameof(ProgramFeature)].RestoreState(new ProgramState(programs));

        dispatch.Dispatch(new RehydrateProgramAction());
    }

    public override void AfterDispatch(object action)
    {
        var currentState = (ProgramState?)_store?.Features[nameof(ProgramFeature)].GetState();
        if (currentState?.SessionBlueprints is null)
        {
            return;
        }

        _programRepository.PersistSessionsInProgramAsync(currentState.SessionBlueprints);
    }
}
