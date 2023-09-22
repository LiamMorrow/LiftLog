using Foundation;
using LiftLog.App.Services;
using UIKit;

namespace LiftLog.App;

[Register("AppDelegate")]
public class AppDelegate : MauiUIApplicationDelegate
{
    protected override MauiApp CreateMauiApp() => MauiProgram.CreateMauiApp();

    public override void OnActivated(UIApplication application)
    {
        base.OnActivated(application);

        var window = UIApplication.SharedApplication.KeyWindow;
        var insets = window.SafeAreaInsets;

        var themeProvider = this.Services.GetRequiredService<AppThemeProvider>();
        var top = insets.Top;
        var bottom = insets.Bottom;
        // themeProvider.SystemSafeInsetTop = $"{top}px";
        // themeProvider.SystemSafeInsetBottom = $"{bottom}px";
        themeProvider.NotifyInsetsChanged();
    }
}
