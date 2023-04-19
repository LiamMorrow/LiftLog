using System.Collections.Concurrent;
using Append.Blazor.Notifications;
using LiftLog.Lib.Services;
using INotificationService = LiftLog.Lib.Services.INotificationService;

namespace LiftLog.WebUi.Services;

public class WebNotificationService : INotificationService
{
    private readonly Append.Blazor.Notifications.INotificationService _notificationService;

    private readonly ConcurrentDictionary<NotificationHandle, CancellationTokenSource> _scheduledNotifications = new ();

    public WebNotificationService(Append.Blazor.Notifications.INotificationService notificationService)
    {
        _notificationService = notificationService;
    }


    public async Task UpdateNotificationAsync(NotificationHandle handle, string title, string message)
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
        await _notificationService.CreateAsync(title, new NotificationOptions()
        {
            Tag = handle.Id.ToString(),
            Body = message,
            Renotify = false
        });
    }

    public Task ClearNotificationAsync(NotificationHandle handle)
    {
        if (_scheduledNotifications.TryGetValue(handle, out var cancellation))
        {
            cancellation.Cancel();
        }
        return Task.CompletedTask;
    }

    public async Task ScheduleNotificationAsync(NotificationHandle handle, DateTimeOffset scheduledFor, string title,
        string message)
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
            _ = Task.Delay(timeToWait, source.Token).ContinueWith((result) =>
            {
                if (result.IsCompletedSuccessfully)
                {
                    _ = UpdateNotificationAsync(handle, title, message);
                }
            });
        }
    }
}