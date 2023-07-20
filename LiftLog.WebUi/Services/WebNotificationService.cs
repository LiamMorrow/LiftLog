using System.Collections.Concurrent;
using Append.Blazor.Notifications;
using LiftLog.Lib.Models;
using LiftLog.Ui.Store.CurrentSession;
using INotificationService = LiftLog.Ui.Services.INotificationService;

namespace LiftLog.WebUi.Services;

public class WebNotificationService : INotificationService
{
    private static readonly NotificationHandle NextSetNotificationHandle = new NotificationHandle(
        "NEXT_SET"
    );
    private readonly Append.Blazor.Notifications.INotificationService _notificationService;

    private readonly ConcurrentDictionary<
        NotificationHandle,
        CancellationTokenSource
    > _scheduledNotifications = new();

    public WebNotificationService(
        Append.Blazor.Notifications.INotificationService notificationService
    )
    {
        _notificationService = notificationService;
    }

    public async Task ScheduleNextSetNotificationAsync(SessionTarget target, RecordedExercise exercise)
    {
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
            await ScheduleNotificationAsync(
                NextSetNotificationHandle,
                DateTimeOffset.Now.Add(rest),
                "Rest Over",
                "Start your next set now!"
            );
        }
    }

    public Task CancelNextSetNotificationAsync()
    {
        return ClearNotificationAsync(NextSetNotificationHandle);
    }

    private async Task UpdateNotificationAsync(
        NotificationHandle handle,
        string title,
        string message
    )
    {
        await _notificationService.CreateAsync(
            title,
            new NotificationOptions()
            {
                Tag = handle.Id,
                Body = message,
                Renotify = false
            }
        );
    }

    private Task ClearNotificationAsync(NotificationHandle handle)
    {
        if (_scheduledNotifications.TryGetValue(handle, out var cancellation))
        {
            cancellation.Cancel();
        }
        return Task.CompletedTask;
    }

    private async Task ScheduleNotificationAsync(
        NotificationHandle handle,
        DateTimeOffset scheduledFor,
        string title,
        string message
    )
    {
        if (!await _notificationService.IsSupportedByBrowserAsync())
        {
            return;
        }
        if (_notificationService.PermissionStatus != PermissionType.Granted)
        {
            if (await _notificationService.RequestPermissionAsync() != PermissionType.Granted)
            {
                return;
            }
        }
        await ClearNotificationAsync(handle);
        var source = new CancellationTokenSource();
        if (_scheduledNotifications.TryAdd(handle, source))
        {
            var timeToWait = new[] { scheduledFor - DateTimeOffset.Now, TimeSpan.Zero }.Max();
            _ = Task.Delay(timeToWait, source.Token)
                .ContinueWith(
                    (result) =>
                    {
                        if (result.IsCompletedSuccessfully)
                        {
                            _ = UpdateNotificationAsync(handle, title, message);
                        }
                    }
                );
        }
    }

    private record NotificationHandle(string Id);
}
