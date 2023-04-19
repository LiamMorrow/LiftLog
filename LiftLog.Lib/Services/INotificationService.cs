namespace LiftLog.Lib.Services;

public interface INotificationService
{
    Task UpdateNotificationAsync(NotificationHandle handle, string title, string message);

    Task ClearNotificationAsync(NotificationHandle handle);

    Task ScheduleNotificationAsync(NotificationHandle handle, DateTimeOffset scheduledFor, string title, string message);
}

public record NotificationHandle(Guid Id);