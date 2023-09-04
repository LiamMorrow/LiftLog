using Android;
using Android.App;
using Android.Content.PM;
using Android.Content.Res;
using Android.OS;
using AndroidX.Core.View;
using Java.Interop;
using LiftLog.App.Services;

namespace LiftLog.App;

[Activity(
    Theme = "@style/Maui.SplashTheme",
    MainLauncher = true,
    ConfigurationChanges = ConfigChanges.ScreenSize
        | ConfigChanges.Orientation
        | ConfigChanges.UiMode
        | ConfigChanges.ScreenLayout
        | ConfigChanges.SmallestScreenSize
        | ConfigChanges.Density
)]
public class MainActivity : MauiAppCompatActivity
{

    protected override void OnCreate(Bundle? savedInstanceState)
    {
        base.OnCreate(savedInstanceState);
        WindowCompat.SetDecorFitsSystemWindows(Window, false);
        var themeProvider = MauiApplication.Current.Services.GetRequiredService<AppThemeProvider>();
        ViewCompat.SetOnApplyWindowInsetsListener(Window.DecorView, new WindowInsetsListener(themeProvider, Resources.DisplayMetrics.Density));
    }


    private class WindowInsetsListener : Java.Lang.Object, IOnApplyWindowInsetsListener
    {
        private readonly AppThemeProvider _themeProvider;
        private readonly float density;

        public WindowInsetsListener(AppThemeProvider themeProvider, float density)
        {
            _themeProvider = themeProvider;
            this.density = density;
        }

        public WindowInsetsCompat OnApplyWindowInsets(Android.Views.View v, WindowInsetsCompat insets)
        {
            // convert android px to css px
            var top = insets.SystemWindowInsetTop / density;
            var bottom = insets.SystemWindowInsetBottom / density;
            _themeProvider.SystemSafeInsetTop = $"{top}px";
            _themeProvider.SystemSafeInsetBottom = $"{bottom}px";
            _themeProvider.NotifyInsetsChanged();
            Console.WriteLine($"Top: {top}:{insets.SystemWindowInsetTop}, Bottom: {bottom}:{insets.SystemWindowInsetBottom}");
            return insets;
        }
    }
}
