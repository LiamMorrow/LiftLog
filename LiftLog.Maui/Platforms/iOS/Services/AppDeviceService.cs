using LiftLog.Ui.Services;

namespace LiftLog.Maui.Services
{
    public class AppDeviceService : IDeviceService
    {
        public bool CanScheduleExactNotifications() => true;

        public Ui.Services.DeviceType GetDeviceType() => Ui.Services.DeviceType.Ios;

        public void RequestExactNotificationPermission() { }
    }
}
