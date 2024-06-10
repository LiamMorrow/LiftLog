using LiftLog.Ui.Services;

namespace LiftLog.Web.Services
{
    public class WebDeviceService : IDeviceService
    {
        public DeviceType GetDeviceType() => DeviceType.Web;
    }
}
