using Fluxor;
using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Ui.Repository;

namespace LiftLog.Ui.Store.Program;

public class PersistProgramMiddleware(ICurrentProgramRepository programRepository) : Middleware
{
    private IStore? _store;
    private ProgramState? _prevState;

    public override async Task InitializeAsync(IDispatcher dispatch, IStore store)
    {
        _store = store;
        var programs = await programRepository.GetSessionsInProgramAsync();
        store
            .Features[nameof(ProgramFeature)]
            .RestoreState(new ProgramState(true, programs, [], true));

        dispatch.Dispatch(new SetProgramIsHydratedAction());
    }

    public override void AfterDispatch(object action)
    {
        var currentState = (ProgramState?)_store?.Features[nameof(ProgramFeature)].GetState();
        if (currentState?.SessionBlueprints is null)
        {
            return;
        }

        if (_prevState is not null && _prevState.Equals(currentState))
        {
            return;
        }

        _prevState = currentState;
        _ = Task.Run(async () =>
        {
            await programRepository.PersistSessionsInProgramAsync(currentState.SessionBlueprints);
        });
    }
}
