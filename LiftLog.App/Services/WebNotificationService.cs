using System.Collections.Concurrent;
using LiftLog.Lib.Services;
using INotificationService = LiftLog.Lib.Services.INotificationService;

namespace LiftLog.WebUi.Services;

public class WebNotificationService : INotificationService
{

    private readonly ConcurrentDictionary<NotificationHandle, CancellationTokenSource> _scheduledNotifications = new ();



    public async Task UpdateNotificationAsync(NotificationHandle handle, string title, string message)
    { 
    }

    public Task ClearNotificationAsync(NotificationHandle handle)
    {
    
        return Task.CompletedTask;
    }

    public async Task ScheduleNotificationAsync(NotificationHandle handle, DateTimeOffset scheduledFor, string title,
        string message)
    {
   
    }
}