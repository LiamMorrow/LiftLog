using System.IO.Compression;
using Fluxor;
using LiftLog.Lib.Models;
using LiftLog.Ui.Repository;
using LiftLog.Ui.Services;
using LiftLog.Ui.Util;

namespace LiftLog.Ui.Store.CurrentSession;

public class CurrentSessionEffects
{
    private readonly IProgressRepository _progressRepository;
    private readonly IState<CurrentSessionState> _state;
    private readonly INotificationService _notificationService;
    private readonly SessionService sessionService;

    public CurrentSessionEffects(
        IProgressRepository progressRepository,
        IState<CurrentSessionState> state,
        INotificationService notificationService,
        SessionService sessionService
    )
    {
        _progressRepository = progressRepository;
        _state = state;
        _notificationService = notificationService;
        this.sessionService = sessionService;
    }

    [EffectMethod]
    public async Task PersistCurrentSession(
        PersistCurrentSessionAction action,
        IDispatcher dispatcher
    )
    {
        await _notificationService.CancelNextSetNotificationAsync();
        var session = action.Target switch
        {
            SessionTarget.WorkoutSession => _state.Value.WorkoutSession,
            SessionTarget.HistorySession => _state.Value.HistorySession,
            _ => throw new Exception()
        };
        if (session is not null)
            await _progressRepository.SaveCompletedSessionAsync(session);
    }

    [EffectMethod]
    public async Task NotifySetTimer(NotifySetTimerAction action, IDispatcher dispatcher)
    {
        await _notificationService.CancelNextSetNotificationAsync();
        var session = action.Target switch
        {
            SessionTarget.WorkoutSession => _state.Value.WorkoutSession,
            SessionTarget.HistorySession => _state.Value.HistorySession,
            _ => throw new Exception()
        };
        if (session?.NextExercise is not null && session.LastExercise is not null)
        {
            await _notificationService.ScheduleNextSetNotificationAsync(
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
        await _notificationService.CancelNextSetNotificationAsync();
        var session = action.Target switch
        {
            SessionTarget.WorkoutSession => _state.Value.WorkoutSession,
            SessionTarget.HistorySession => _state.Value.HistorySession,
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
        await _progressRepository.DeleteSessionAsync(action.Session);
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
