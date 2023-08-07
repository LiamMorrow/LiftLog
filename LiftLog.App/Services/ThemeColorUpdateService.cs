#if ANDROID
using Android.App;
using AndroidX.Core.View;
#endif
using MaterialColorUtilities.Maui;
using Microsoft.Extensions.Options;
using Microsoft.Maui.Platform;

namespace LiftLog.App.Services;

public class ThemeColorUpdateService : MaterialColorService
{
    private readonly WeakEventManager _weakEventManager = new();

    public ThemeColorUpdateService(
        IOptions<MaterialColorOptions> options,
        IDynamicColorService dynamicColorService,
        IPreferences preferences
    )
        : base(options, dynamicColorService, preferences) { }

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
        Android.Graphics.Color navColor = SchemeMaui.SurfaceContainer.ToPlatform();
        activity.Window!.SetNavigationBarColor(navColor);
        Android.Graphics.Color statusColor = SchemeMaui.Surface.ToPlatform();
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
