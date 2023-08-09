using System.IO.Compression;
using Fluxor;
using LiftLog.Ui.Repository;
using LiftLog.Ui.Services;
using LiftLog.Ui.Util;

namespace LiftLog.Ui.Store.CurrentSession;

public class CurrentSessionEffects
{
    private readonly IProgressRepository _ProgressRepository;
    private readonly IState<CurrentSessionState> _state;
    private readonly INotificationService _notificationService;

    public CurrentSessionEffects(
        IProgressRepository ProgressRepository,
        IState<CurrentSessionState> state,
        INotificationService notificationService
    )
    {
        _ProgressRepository = ProgressRepository;
        _state = state;
        _notificationService = notificationService;
    }

    [EffectMethod]
    public async Task PersistCurrentSession(PersistCurrentSessionAction action, IDispatcher dispatcher)
    {
        await _notificationService.CancelNextSetNotificationAsync();
        var session = action.Target switch
        {
            SessionTarget.WorkoutSession => _state.Value.WorkoutSession,
            SessionTarget.HistorySession => _state.Value.HistorySession,
            _ => throw new Exception()
        };
        if (session is not null)
            await _ProgressRepository.SaveCompletedSessionAsync(session);
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
        if (session?.NextExercise is not null)
        {
            await _notificationService.ScheduleNextSetNotificationAsync(action.Target, session.NextExercise);
        }
    }

    [EffectMethod]
    public async Task CompleteSetFromNotification(CompleteSetFromNotificationAction action, IDispatcher dispatcher)
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
            var setIndex = session.NextExercise.RecordedSets.IndexedTuples()
                .Where(x => x.Item is null)
                .Select(x => x.Index as int?)
                .DefaultIfEmpty(null)
                .First();
            if (setIndex is not null)
            {
                dispatcher.Dispatch(new CycleExerciseRepsAction(action.Target, exerciseIndex, setIndex.Value));
                dispatcher.Dispatch(new NotifySetTimerAction(action.Target));
            }
        }
    }

    [EffectMethod]
    public async Task DeleteSession(DeleteSessionAction action, IDispatcher dispatcher)
    {
        await _ProgressRepository.DeleteSessionAsync(action.Session);
    }
}
