using Android.App;
using Android.Content;
using LiftLog.Ui.Services;

namespace LiftLog.App.Services
{
    public class AppDeviceService : IDeviceService
    {
        public bool CanScheduleExactNotifications()
        {
            if (
                OperatingSystem.IsAndroidVersionAtLeast(31)
                && Platform.CurrentActivity is Activity activity
            )
            {
                return AlarmManager.FromContext(activity)?.CanScheduleExactAlarms() ?? true;
            }
            return true;
        }

        public Ui.Services.DeviceType GetDeviceType() => Ui.Services.DeviceType.Android;

        public void RequestExactNotificationPermission()
        {
            if (!OperatingSystem.IsAndroidVersionAtLeast(31))
            {
                return;
            }
            var intent = new Intent(
                Android.Provider.Settings.ActionRequestScheduleExactAlarm,
                Android.Net.Uri.Parse("package:com.limajuice.liftlog")
            );
            var activity = Platform.CurrentActivity;
            activity?.StartActivity(intent);
        }
    }
}
