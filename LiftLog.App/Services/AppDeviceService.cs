using LiftLog.Ui.Services;

namespace LiftLog.App.Services
{
    public class AppDeviceService : IDeviceService
    {
        public Ui.Services.DeviceType GetDeviceType()
        {
#if __ANDROID__
            return Ui.Services.DeviceType.Android;
#elif __IOS__
            return Ui.Services.DeviceType.Ios;
#else
            throw new System.Exception("Unsupported platform");
#endif
        }
    }
}
