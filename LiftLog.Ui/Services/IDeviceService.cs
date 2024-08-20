namespace LiftLog.Ui.Services;

public enum DeviceType
{
    Android,
    Ios,
    Web,
}

public interface IDeviceService
{
    DeviceType GetDeviceType();

    bool CanScheduleExactNotifications();

    void RequestExactNotificationPermission();
}
