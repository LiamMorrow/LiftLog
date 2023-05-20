using System.Diagnostics.Metrics;
using LiftLog.Lib.Models;
using INotificationService = LiftLog.Lib.Services.INotificationService;
using ILocalNotificationService = Plugin.LocalNotification.INotificationService;
using Plugin.LocalNotification;
using Plugin.LocalNotification.AndroidOption;

namespace LiftLog.App.Services;

public class MauiNotificationService : INotificationService
{
    private readonly ILocalNotificationService _notificationService;
    private static readonly NotificationHandle NextSetNotificationHandle = new(1000);
    public const string NextSetNotificationChannelId = "Set Timers";

    public MauiNotificationService(ILocalNotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    public async Task ScheduleNextSetNotificationAsync(RecordedExercise exercise)
    {
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
            var request = new NotificationRequest
            {
                NotificationId = NextSetNotificationHandle.Id,
                Title = "Rest Over",
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
