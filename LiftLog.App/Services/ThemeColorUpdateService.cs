using LiftLog.Ui.Models;
using MaterialColorUtilities.Maui;
using MaterialColorUtilities.Schemes;
using Microsoft.Extensions.Options;
using Microsoft.Maui.Platform;
#if ANDROID
using Android.App;
using AndroidX.Core.View;
#endif

namespace LiftLog.App.Services;

public class ThemeColorUpdateService(
    IOptions<MaterialColorOptions> options,
    IDynamicColorService dynamicColorService,
    IPreferences preferences
)
    : MaterialColorService<
        AppCorePalette,
        AppColorScheme<uint>,
        Scheme<Color>,
        AppLightSchemeMapper,
        AppDarkSchemeMapper
    >(options, dynamicColorService, preferences)
{
    // Sometimes it does not update the theme until the device is rotated
    // I have a feeling that the weak event has released the listener
    // I think we can do a better job of listening (maybe via the store?)
    private readonly WeakEventManager _weakEventManager = new();

    public event EventHandler SeedChanged
    {
        add => _weakEventManager.AddEventHandler(value);
        remove => _weakEventManager.RemoveEventHandler(value);
    }

    protected override async void Apply()
    {
        base.Apply();
        _weakEventManager.HandleEvent(null!, null!, nameof(SeedChanged));
#if ANDROID
        Activity activity = await Platform.WaitForActivityAsync();

        // Update status/navigation bar background color
        Android.Graphics.Color navColor = Android.Graphics.Color.Transparent;
        activity.Window!.SetNavigationBarColor(navColor);
        Android.Graphics.Color statusColor = Android.Graphics.Color.Transparent;
        activity.Window!.SetStatusBarColor(statusColor);

        // Update status/navigation bar text/icon color
        _ = new WindowInsetsControllerCompat(activity.Window, activity.Window.DecorView)
        {
            AppearanceLightStatusBars = !IsDark,
            AppearanceLightNavigationBars = !IsDark
        };
#endif
    }
}
