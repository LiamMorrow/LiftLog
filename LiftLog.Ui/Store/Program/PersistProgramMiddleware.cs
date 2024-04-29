using System.Collections.Immutable;
using Fluxor;
using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Ui.Services;
using Microsoft.Extensions.Logging;

namespace LiftLog.Ui.Store.Program;

public class PersistProgramMiddleware(
    CurrentProgramRepository programRepository,
    ILogger<PersistProgramMiddleware> logger
) : Middleware
{
    private IStore? _store;
    private ProgramState? _prevState;

    public override async Task InitializeAsync(IDispatcher dispatch, IStore store)
    {
        try
        {
            _store = store;
            var sessionsInCurrentProgram = await programRepository.GetSessionsInProgramAsync();
            store
                .Features[nameof(ProgramFeature)]
                .RestoreState(
                    new ProgramState(
                        IsHydrated: true,
                        SessionBlueprints: sessionsInCurrentProgram,
                        UpcomingSessions: [],
                        IsLoadingUpcomingSessions: true,
                        SavedPrograms: ImmutableDictionary<Guid, ProgramBlueprint>.Empty
                    )
                );
        }
        catch (Exception e)
        {
            logger.LogError(e, "Failed to restore program state");
            throw;
        }

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
