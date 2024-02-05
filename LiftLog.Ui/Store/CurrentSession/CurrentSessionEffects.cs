using System.IO.Compression;
using Fluxor;
using LiftLog.Lib.Models;
using LiftLog.Ui.Repository;
using LiftLog.Ui.Services;

namespace LiftLog.Ui.Store.CurrentSession;

public class CurrentSessionEffects(
    IProgressRepository progressRepository,
    IState<CurrentSessionState> state,
    INotificationService notificationService,
    SessionService sessionService
)
{
    [EffectMethod]
    public async Task PersistCurrentSession(
        PersistCurrentSessionAction action,
        IDispatcher dispatcher
    )
    {
        await notificationService.CancelNextSetNotificationAsync();
        var session = action.Target switch
        {
            SessionTarget.WorkoutSession => state.Value.WorkoutSession,
            SessionTarget.HistorySession => state.Value.HistorySession,
            _ => throw new Exception()
        };
        if (session is not null)
            await progressRepository.SaveCompletedSessionAsync(session);
    }

    [EffectMethod]
    public async Task NotifySetTimer(NotifySetTimerAction action, IDispatcher dispatcher)
    {
        await notificationService.CancelNextSetNotificationAsync();
        var session = action.Target switch
        {
            SessionTarget.WorkoutSession => state.Value.WorkoutSession,
            SessionTarget.HistorySession => state.Value.HistorySession,
            _ => throw new Exception()
        };
        if (session?.NextExercise is not null && session.LastExercise is not null)
        {
            await notificationService.ScheduleNextSetNotificationAsync(
                action.Target,
                session.LastExercise
            );
        }
    }

    [EffectMethod]
    public async Task CompleteSetFromNotification(
        CompleteSetFromNotificationAction action,
        IDispatcher dispatcher
    )
    {
        await notificationService.CancelNextSetNotificationAsync();
        var session = action.Target switch
        {
            SessionTarget.WorkoutSession => state.Value.WorkoutSession,
            SessionTarget.HistorySession => state.Value.HistorySession,
            _ => throw new Exception()
        };
        if (session?.NextExercise is not null)
        {
            var exerciseIndex = session.RecordedExercises.IndexOf(session.NextExercise);
            var setIndex = session.NextExercise.PotentialSets.IndexOf(x => x.Set is null);
            if (setIndex is not -1)
            {
                dispatcher.Dispatch(
                    new CycleExerciseRepsAction(action.Target, exerciseIndex, setIndex)
                );
                dispatcher.Dispatch(new NotifySetTimerAction(action.Target));
            }
        }
    }

    [EffectMethod]
    public async Task DeleteSession(DeleteSessionAction action, IDispatcher dispatcher)
    {
        await progressRepository.DeleteSessionAsync(action.Session);
    }

    [EffectMethod]
    public async Task SetCurrentSessionFromBlueprint(
        SetCurrentSessionFromBlueprintAction action,
        IDispatcher dispatcher
    )
    {
        var session = await sessionService.HydrateSessionFromBlueprint(action.Blueprint);
        dispatcher.Dispatch(new SetCurrentSessionAction(action.Target, session));
    }
}
