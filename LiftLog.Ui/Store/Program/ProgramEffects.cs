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
        dispatcher.Dispatch(new SetUpcomingSessionsAction(RemoteData.Loading));
        var numberOfUpcomingSessions = Math.Max(
            state.Value.GetActivePlanSessionBlueprints().Count,
            3
        );
        var sessions = await sessionService
            .GetUpcomingSessionsAsync(state.Value.GetActivePlanSessionBlueprints())
            .Take(numberOfUpcomingSessions)
            .ToImmutableListValueAsync();
        dispatcher.Dispatch(new SetUpcomingSessionsAction(RemoteData.Success(sessions)));
    }
}
