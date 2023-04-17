using Append.Blazor.Notifications;
using LiftLog.Lib.Services;
using INotificationService = LiftLog.Lib.Services.INotificationService;

namespace LiftLog.WebUi.Services;

public class WebNotificationService : INotificationService
{
    private readonly Append.Blazor.Notifications.INotificationService _notificationService;

    public WebNotificationService(Append.Blazor.Notifications.INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    public async Task<NotificationHandle> SendNotificationAsync(string title, string message)
    {
        if (!await _notificationService.IsSupportedByBrowserAsync())
        {
            return new NotificationHandle(Guid.Empty);
        }
        if (_notificationService.PermissionStatus != PermissionType.Granted)
        {
            if (await _notificationService.RequestPermissionAsync() != PermissionType.Granted)
            {
                return new NotificationHandle(Guid.Empty);
            }
        }

        var handle = new NotificationHandle(Guid.NewGuid());
        await _notificationService.CreateAsync(title, new NotificationOptions()
        {
            Tag = handle.Id.ToString(),
            Body = message,
            Renotify = false
        });
        return handle;
    }

    public async Task UpdateNotificationAsync(NotificationHandle handle, string title, string message)
    {
        await _notificationService.CreateAsync(title, new NotificationOptions()
        {
            Tag = handle.Id.ToString(),
            Body = message,
            Renotify = false
        });
    }

    public Task ClearNotificationAsync(NotificationHandle handle)
    {
        return Task.CompletedTask;
    }
}