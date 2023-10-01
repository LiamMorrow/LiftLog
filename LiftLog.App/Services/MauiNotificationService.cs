using LiftLog.Lib.Models;
using LiftLog.Ui.Store.CurrentSession;
using Plugin.LocalNotification;
using Plugin.LocalNotification.AndroidOption;
using Plugin.LocalNotification.EventArgs;
using ILocalNotificationService = Plugin.LocalNotification.INotificationService;
using INotificationService = LiftLog.Ui.Services.INotificationService;
using IDispatcher = Fluxor.IDispatcher;
using Fluxor;

namespace LiftLog.App.Services;

public class MauiNotificationService : INotificationService
{
    private readonly ILocalNotificationService _notificationService;
    private readonly IDispatcher _dispatcher;
    private readonly IState<CurrentSessionState> _state;
    private static readonly NotificationHandle NextSetNotificationHandle = new(1000);
    public const string NextSetNotificationChannelId = "Set Timers";

    public MauiNotificationService(
        ILocalNotificationService notificationService,
        IDispatcher dispatcher,
        IState<CurrentSessionState> state
    )
    {
        _notificationService = notificationService;
        _dispatcher = dispatcher;
        _state = state;
    }

    public async Task ScheduleNextSetNotificationAsync(
        SessionTarget target,
        RecordedExercise exercise
    )
    {
        var id = Guid.NewGuid();
        _dispatcher.Dispatch(new SetLatestSetTimerNotificationIdAction(id));
        await _notificationService.RequestNotificationPermission();
        _notificationService.Cancel(NextSetNotificationHandle.Id);
        var rest = exercise switch
        {
            { LastRecordedSet: not null }
                => exercise.LastRecordedSet?.RepsCompleted == exercise.Blueprint.RepsPerSet
                    ? exercise.Blueprint.RestBetweenSets.MinRest
                    : exercise.Blueprint.RestBetweenSets.FailureRest,
            _ => TimeSpan.Zero,
        };
        if (rest != TimeSpan.Zero)
        {
            _notificationService.NotificationActionTapped += Current_NotificationActionTapped;

            void Current_NotificationActionTapped(NotificationActionEventArgs e)
            {
                _notificationService.NotificationActionTapped -= Current_NotificationActionTapped;
                if (_state.Value.LatestSetTimerNotificationId != id)
                {
                    return;
                }
                _notificationService.Cancel(NextSetNotificationHandle.Id);
                switch (e.ActionId)
                {
                    case 100:
                        _dispatcher.Dispatch(new CompleteSetFromNotificationAction(target));
                        break;
                }
            }
            var request = new NotificationRequest
            {
                NotificationId = NextSetNotificationHandle.Id,
                Title = "Rest Over",
                CategoryType = NotificationCategoryType.Status,
                Description = "Rest over - start your next set!",
                Android = new AndroidOptions() { ChannelId = NextSetNotificationChannelId },
                Schedule = new NotificationRequestSchedule()
                {
                    NotifyTime = DateTime.Now.Add(rest),
                    RepeatType = NotificationRepeat.No,
                },
            };
            await _notificationService.Show(request);
        }
    }

    public Task CancelNextSetNotificationAsync()
    {
        _notificationService.Cancel(NextSetNotificationHandle.Id);
        return Task.CompletedTask;
    }

    private record NotificationHandle(int Id);
}
