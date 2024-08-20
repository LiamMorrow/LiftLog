using Android.App;
using AndroidX.Core.View;
using Fluxor;
using LiftLog.Ui.Store.App;

namespace LiftLog.Maui.Services;

public partial class ThemeEffects
{
    [EffectMethod]
    public async Task OnThemeColorUpdated(ThemeColorUpdatedAction action, Fluxor.IDispatcher __)
    {
        Activity activity = await Platform.WaitForActivityAsync();

        // Update status/navigation bar background color
        Android.Graphics.Color navColor = Android.Graphics.Color.Transparent;
        activity.Window!.SetNavigationBarColor(navColor);
        Android.Graphics.Color statusColor = Android.Graphics.Color.Transparent;
        activity.Window!.SetStatusBarColor(statusColor);

        // Update status/navigation bar text/icon color
        _ = new WindowInsetsControllerCompat(activity.Window, activity.Window.DecorView)
        {
            AppearanceLightStatusBars = !action.IsDark,
            AppearanceLightNavigationBars = !action.IsDark,
        };
    }
}
