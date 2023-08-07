#if ANDROID
using Android.App;
using AndroidX.Core.View;
#endif
using LiftLog.Ui.Services;
using Microsoft.Maui.Platform;

namespace LiftLog.App.Services;

public class NotificationBarColorUpdateUserScrollListener : IUserScrollListener
{
    private ThemeColorUpdateService _themeProvider;

    public NotificationBarColorUpdateUserScrollListener(ThemeColorUpdateService themeProvider)
    {
        _themeProvider = themeProvider;
    }

    public async ValueTask ScrollHasChangedAsync(bool hasScrolled)
    {
#if ANDROID
        var scheme = _themeProvider.SchemeMaui;
        Activity activity = await Platform.WaitForActivityAsync();
        Android.Graphics.Color androidColor;
        if (hasScrolled)
        {
            androidColor = scheme.SurfaceContainer.ToPlatform();
        }
        else
        {
            androidColor = scheme.Surface.ToPlatform();
        }
        activity.Window!.SetStatusBarColor(androidColor);
#endif
    }
}
