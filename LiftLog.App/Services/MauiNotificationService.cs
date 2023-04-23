using System.Collections.Concurrent;
using LiftLog.Lib.Services;
using INotificationService = LiftLog.Lib.Services.INotificationService;
using Plugin.LocalNotification;

namespace LiftLog.App.Services;

public class MauiNotificationService : INotificationService
{

    private readonly ConcurrentDictionary<NotificationHandle, CancellationTokenSource> _scheduledNotifications = new ();



    public async Task UpdateNotificationAsync(NotificationHandle handle, string title, string message)
    { 
        await LocalNotificationCenter.Current.RequestNotificationPermission();
        var request = new NotificationRequest {
            NotificationId = handle.Id.GetHashCode(),
            Title = title,
            Subtitle = message,
        };
        await LocalNotificationCenter.Current.Show(request);
    }

    public Task ClearNotificationAsync(NotificationHandle handle)
    {
        LocalNotificationCenter.Current.Clear(handle.Id.GetHashCode());
        return Task.CompletedTask;
    }

    public async Task ScheduleNotificationAsync(NotificationHandle handle, DateTimeOffset scheduledFor, string title,
        string message)
    {
        await LocalNotificationCenter.Current.RequestNotificationPermission();
        var request = new NotificationRequest {
            NotificationId = handle.Id.GetHashCode(),
            Title = title,
            Subtitle = message,
            Schedule = new NotificationRequestSchedule()
            {
                NotifyTime = scheduledFor.DateTime,
                RepeatType = NotificationRepeat.No,
            }
        };
        await LocalNotificationCenter.Current.Show(request);
        
    }
}