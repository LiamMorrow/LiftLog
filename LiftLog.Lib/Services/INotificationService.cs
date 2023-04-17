namespace LiftLog.Lib.Services;

public interface INotificationService
{
    Task UpdateNotificationAsync(NotificationHandle handle, string title, string message);

    Task ClearNotificationAsync(NotificationHandle handle);
}

public record NotificationHandle(Guid Id);