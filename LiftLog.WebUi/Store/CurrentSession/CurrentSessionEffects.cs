using Fluxor;
using LiftLog.Lib.Models;
using LiftLog.Lib.Services;
using LiftLog.Lib.Store;

namespace LiftLog.WebUi.Store.CurrentSession;

public class CurrentSessionEffects
{
    private readonly IProgressStore _progressStore;
    private readonly IState<CurrentSessionState> _state;
    private readonly INotificationService _notificationService;

    public CurrentSessionEffects(IProgressStore progressStore, IState<CurrentSessionState> state,
        INotificationService notificationService)
    {
        _progressStore = progressStore;
        _state = state;
        _notificationService = notificationService;
    }

    [EffectMethod]
    public async Task PersistCurrentSession(PersistCurrentSessionAction _, IDispatcher dispatcher)
    {
        if (_state.Value.Session is not null)
            await _progressStore.SaveCompletedSessionAsync(_state.Value.Session);
    }

    [EffectMethod]
    public async Task NotifySetTimer(NotifySetTimerAction _, IDispatcher dispatcher)
    {
        var notificationHandle = _state.Value.SetTimerNotificationHandle;
        if (notificationHandle is null)
        {
            notificationHandle = new NotificationHandle(Guid.NewGuid());
            dispatcher.Dispatch(new SetNotificationHandleAction(notificationHandle));
        }

        if (_state.Value.Session?.NextExercise is not null)
        {
            var message = _state.Value.Session?.NextExercise switch
            {
                { LastRecordedSet: not null } exercise => exercise.LastRecordedSet?.RepsCompleted ==
                                                          exercise.Blueprint.RepsPerSet
                    ? $"Rest {exercise.Blueprint.RestBetweenSets.MinRest} if it was easy, or {exercise.Blueprint.RestBetweenSets.SecondaryRest} if it was hard"
                    : $"Rest {exercise.Blueprint.RestBetweenSets.FailureRest}",
                _ => null,
            };
            if (message != null)
            {
                await _notificationService.UpdateNotificationAsync(notificationHandle, "Rest", message);
            }
        }
    }
}