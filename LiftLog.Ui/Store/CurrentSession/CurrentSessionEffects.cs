using Fluxor;
using LiftLog.Lib.Services;
using LiftLog.Lib.Store;

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
    public async Task PersistCurrentSession(PersistCurrentSessionAction _, IDispatcher dispatcher)
    {
        await _notificationService.CancelNextSetNotificationAsync();
        if (_state.Value.Session is not null)
            await _progressStore.SaveCompletedSessionAsync(_state.Value.Session);
    }

    [EffectMethod]
    public async Task NotifySetTimer(NotifySetTimerAction _, IDispatcher dispatcher)
    {
        await _notificationService.CancelNextSetNotificationAsync();
        if (_state.Value.Session?.NextExercise is not null)
        {
            await _notificationService.ScheduleNextSetNotificationAsync(
                _state.Value.Session.NextExercise
            );
        }
    }

    [EffectMethod]
    public async Task DeleteSession(DeleteSessionAction action, IDispatcher dispatcher)
    {
        await _progressStore.DeleteSessionAsync(action.Session);
    }
}
