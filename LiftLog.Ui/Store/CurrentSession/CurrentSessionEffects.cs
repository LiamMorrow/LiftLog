using System.IO.Compression;
using Fluxor;
using LiftLog.Lib.Store;
using LiftLog.Ui.Services;
using LiftLog.Ui.Util;

namespace LiftLog.Ui.Store.CurrentSession;

public class CurrentSessionEffects
{
    private readonly IProgressStore _progressStore;
    private readonly IState<CurrentSessionState> _state;
    private readonly INotificationService _notificationService;

    public CurrentSessionEffects(
        IProgressStore progressStore,
        IState<CurrentSessionState> state,
        INotificationService notificationService
    )
    {
        _progressStore = progressStore;
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
            await _progressStore.SaveCompletedSessionAsync(session);
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
        await _progressStore.DeleteSessionAsync(action.Session);
    }
}
