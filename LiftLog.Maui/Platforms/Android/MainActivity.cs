using Android;
using Android.App;
using Android.Content.PM;
using Android.Content.Res;
using Android.OS;
using Android.Renderscripts;
using Android.Views;
using AndroidX.Core.View;
using LiftLog.Ui.Services;

namespace LiftLog.Maui;

[Activity(
    Theme = "@style/Maui.SplashTheme",
    MainLauncher = true,
    ConfigurationChanges = ConfigChanges.ScreenSize
        | ConfigChanges.Orientation
        | ConfigChanges.UiMode
        | ConfigChanges.ScreenLayout
        | ConfigChanges.SmallestScreenSize
        | ConfigChanges.Density,
    Exported = true,
    // App crashes if its open and receives an intent without this
    LaunchMode = LaunchMode.SingleTask
)]
[IntentFilter(
    [Android.Content.Intent.ActionView],
    AutoVerify = true,
    Categories = [Android.Content.Intent.CategoryDefault, Android.Content.Intent.CategoryBrowsable],
    DataScheme = "https",
    DataHost = "app.liftlog.online"
)]
[IntentFilter(
    [Android.Content.Intent.ActionView],
    AutoVerify = true,
    Categories = [Android.Content.Intent.CategoryDefault, Android.Content.Intent.CategoryBrowsable],
    DataScheme = "liftlog",
    DataHost = "app.liftlog.online"
)]
public class MainActivity : MauiAppCompatActivity
{
    protected override void OnCreate(Bundle? savedInstanceState)
    {
        base.OnCreate(savedInstanceState);
        WindowCompat.SetDecorFitsSystemWindows(Window!, false);
        WebViewSoftInputPatch.Initialize();
        var insetsManager = IPlatformApplication
            .Current?.Services
            .GetRequiredService<InsetsManager>();
        if (insetsManager is not null)
        {
            insetsManager.SystemSafeInsetBottom =
                $"{WebViewSoftInputPatch.GetNavBarHeight() / Resources!.DisplayMetrics!.Density}px";
            insetsManager.SystemSafeInsetTop =
                $"{WebViewSoftInputPatch.GetStatusBarHeight() / Resources.DisplayMetrics.Density}px";
            ViewCompat.SetOnApplyWindowInsetsListener(
                Window!.DecorView,
                new WindowInsetsListener(insetsManager!, Resources.DisplayMetrics.Density)
            );
        }
    }

    private class WindowInsetsListener(InsetsManager insetsManager, float density)
        : Java.Lang.Object,
            IOnApplyWindowInsetsListener
    {
        public WindowInsetsCompat OnApplyWindowInsets(
            Android.Views.View v,
            WindowInsetsCompat insets
        )
        {
            // convert android px to css px
            float top,
                bottom;
            if (OperatingSystem.IsAndroidVersionAtLeast(30))
            {
                var systemInsets = insets.GetInsets(WindowInsets.Type.SystemBars());
                top = systemInsets.Top / density;
                bottom = systemInsets.Bottom / density;
            }
            else
            {
#pragma warning disable CS0618 // Type or member is obsolete
                top = insets.SystemWindowInsetTop / density;
                bottom = insets.SystemWindowInsetBottom / density;
#pragma warning restore CS0618 // Type or member is obsolete
            }
            if (top == 0 || bottom == 0)
            {
                insetsManager.SystemSafeInsetBottom =
                    $"{WebViewSoftInputPatch.GetNavBarHeight() / density}px";
                insetsManager.SystemSafeInsetTop =
                    $"{WebViewSoftInputPatch.GetStatusBarHeight() / density}px";
                insetsManager.NotifyInsetsChanged();
                return insets;
            }
            insetsManager.SystemSafeInsetTop = $"{top}px";
            insetsManager.SystemSafeInsetBottom = $"{bottom}px";
            insetsManager.NotifyInsetsChanged();
            return insets;
        }
    }
}
