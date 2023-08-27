// ReSharper disable UnusedMember.Global

using System.Collections.Immutable;
using Fluxor;
using LiftLog.Lib;
using LiftLog.Ui.Services;
using LiftLog.Ui.Util;

namespace LiftLog.Ui.Store.Program;

public class ProgramEffects
{
    private readonly SessionService sessionService;
    private readonly IState<ProgramState> state;

    public ProgramEffects(SessionService sessionService, IState<ProgramState> state)
    {
        this.sessionService = sessionService;
        this.state = state;
    }

    [EffectMethod(typeof(FetchUpcomingSessionsAction))]
    public async Task FetchUpcomingSessions(IDispatcher dispatcher)
    {
        var numberOfUpcomingSessions = Math.Max(state.Value.SessionBlueprints.Count, 3);
        var sessions = await sessionService.GetUpcomingSessionsAsync()
         .Take(numberOfUpcomingSessions)
         .ToImmutableListAsync();
        dispatcher.Dispatch(new SetUpcomingSessionsAction(sessions));
    }

    [EffectMethod(typeof(FetchExerciseNamesAction))]
    public async Task FetchExerciseNames(IDispatcher dispatcher)
    {
        var exerciseNames = await sessionService.GetLatestSessionsAsync()
            .SelectMany(x => x.Blueprint.Exercises.Select(ex => ex.Name).ToAsyncEnumerable())
            .Concat(state.Value.SessionBlueprints.SelectMany(x => x.Exercises.Select(ex => ex.Name)).ToAsyncEnumerable())
            .Distinct()
            .ToImmutableListAsync();
        dispatcher.Dispatch(new SetExerciseNamesAction(exerciseNames));
    }
}
