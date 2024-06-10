using LiftLog.Ui.Services;

namespace LiftLog.Web.Services
{
    public class WebDeviceService : IDeviceService
    {
        public bool CanScheduleExactNotifications() => true;

        public DeviceType GetDeviceType() => DeviceType.Web;

        public void RequestExactNotificationPermission() { }
    }
}
