using Fluxor;
using LiftLog.Lib.Models;
using LiftLog.Ui.Store.CurrentSession;
using Plugin.LocalNotification;
using Plugin.LocalNotification.AndroidOption;
using Plugin.LocalNotification.EventArgs;
using IDispatcher = Fluxor.IDispatcher;
using ILocalNotificationService = Plugin.LocalNotification.INotificationService;
using INotificationService = LiftLog.Ui.Services.INotificationService;

namespace LiftLog.App.Services;

public class MauiNotificationService(
    ILocalNotificationService notificationService,
    IDispatcher dispatcher,
    IState<CurrentSessionState> state
) : INotificationService
{
    private static readonly NotificationHandle NextSetNotificationHandle = new(1000);
    public const string NextSetNotificationChannelId = "Set Timers";

    public async Task ScheduleNextSetNotificationAsync(
        SessionTarget target,
        RecordedExercise exercise
    )
    {
        var id = Guid.NewGuid();
        dispatcher.Dispatch(new SetLatestSetTimerNotificationIdAction(id));
        await notificationService.RequestNotificationPermission();
        notificationService.Cancel(NextSetNotificationHandle.Id);
        var rest = exercise switch
        {
            { LastRecordedSet: not null }
                => exercise.LastRecordedSet?.Set?.RepsCompleted >= exercise.Blueprint.RepsPerSet
                    ? exercise.Blueprint.RestBetweenSets.MinRest
                    : exercise.Blueprint.RestBetweenSets.FailureRest,
            _ => TimeSpan.Zero,
        };
        if (rest != TimeSpan.Zero)
        {
            notificationService.NotificationActionTapped += Current_NotificationActionTapped;

            void Current_NotificationActionTapped(NotificationActionEventArgs e)
            {
                notificationService.NotificationActionTapped -= Current_NotificationActionTapped;
                if (state.Value.LatestSetTimerNotificationId != id)
                {
                    return;
                }
                notificationService.Cancel(NextSetNotificationHandle.Id);
                switch (e.ActionId)
                {
                    case 100:
                        dispatcher.Dispatch(new CompleteSetFromNotificationAction(target));
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
            await notificationService.Show(request);
        }
    }

    public Task CancelNextSetNotificationAsync()
    {
        notificationService.Cancel(NextSetNotificationHandle.Id);
        return Task.CompletedTask;
    }

    private record NotificationHandle(int Id);
}
