// ReSharper disable UnusedMember.Global

using System.Collections.Immutable;
using Fluxor;
using LiftLog.Lib;
using LiftLog.Ui.Services;

namespace LiftLog.Ui.Store.Program;

public class ProgramEffects(SessionService sessionService, IState<ProgramState> state)
{
    [EffectMethod(typeof(FetchUpcomingSessionsAction))]
    public async Task FetchUpcomingSessions(IDispatcher dispatcher)
    {
        var numberOfUpcomingSessions = Math.Max(state.Value.SessionBlueprints.Count, 3);
        var sessions = await sessionService
            .GetUpcomingSessionsAsync()
            .Take(numberOfUpcomingSessions)
            .ToImmutableListAsync();
        dispatcher.Dispatch(new SetUpcomingSessionsAction(sessions));
    }
}
