using System.Collections.Immutable;
using Fluxor;
using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Ui.Services;
using Microsoft.Extensions.Logging;

namespace LiftLog.Ui.Store.Program;

public class PersistProgramMiddleware(
    CurrentProgramRepository programRepository,
    SavedProgramRepository savedProgramRepository,
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
            var savedProgramsTask = savedProgramRepository.GetSavedProgramsAsync();
            var activeProgramId = await savedProgramRepository.GetActivePlanIdAsync();
            var builtInPrograms = BuiltInProgramService.BuiltInPrograms;
            var savedPrograms = await savedProgramsTask;
            // Legacy path where there could exist a non named program.
            if (activeProgramId is null || !savedPrograms.ContainsKey(activeProgramId.Value))
            {
                var sessionsInCurrentProgram = await programRepository.GetSessionsInProgramAsync();
                activeProgramId = Guid.NewGuid();
                savedPrograms = savedPrograms.Add(
                    activeProgramId.Value,
                    new ProgramBlueprint(
                        Name: "My Program",
                        Sessions: sessionsInCurrentProgram,
                        LastEdited: DateOnly.FromDateTime(DateTime.Now)
                    )
                );
            }
            foreach (var (id, program) in builtInPrograms)
            {
                if (savedPrograms.ContainsKey(id))
                {
                    continue;
                }
                savedPrograms = savedPrograms.Add(id, program);
            }

            store
                .Features[nameof(ProgramFeature)]
                .RestoreState(
                    new ProgramState(
                        IsHydrated: true,
                        UpcomingSessions: RemoteData.NotAsked,
                        SavedPrograms: savedPrograms,
                        ActivePlanId: activeProgramId.Value
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
        if (currentState is null)
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
            var curState = (ProgramState?)_store?.Features[nameof(ProgramFeature)].GetState();
            if (curState is null)
            {
                return;
            }
            await savedProgramRepository.Persist(curState.SavedPrograms, curState.ActivePlanId);
        });
    }
}
