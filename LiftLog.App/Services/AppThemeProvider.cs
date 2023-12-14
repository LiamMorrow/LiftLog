using LiftLog.Ui.Services;
using MaterialColorUtilities.Schemes;
using Microsoft.Maui.ApplicationModel;

namespace LiftLog.App.Services;

public class AppThemeProvider(ThemeColorUpdateService colorUpdateService) : IThemeProvider
{
    public Scheme<uint> GetColorScheme() => colorUpdateService.SchemeInt;

    public event EventHandler SeedChanged
    {
        add => colorUpdateService.SeedChanged += value;
        remove => colorUpdateService.SeedChanged -= value;
    }

    public event EventHandler? InsetsChanged;

    public string SystemSafeInsetTop { get; set; } = "env(safe-area-inset-top, 0px)";

    public string SystemSafeInsetBottom { get; set; } = "env(safe-area-inset-bottom, 0px)";

    public void NotifyInsetsChanged() => InsetsChanged?.Invoke(this, EventArgs.Empty);

    public void SetSeedColor(uint? seed, ThemePreference themePreference)
    {
        if (Microsoft.Maui.Controls.Application.Current is null)
        {
            return;
        }
        Microsoft.Maui.Controls.Application.Current.UserAppTheme = themePreference switch
        {
            ThemePreference.FollowSystem => AppTheme.Unspecified,
            ThemePreference.Light => AppTheme.Light,
            ThemePreference.Dark => AppTheme.Dark,
            _
                => throw new ArgumentOutOfRangeException(
                    nameof(themePreference),
                    themePreference,
                    null
                )
        };
        if (seed is not null)
            colorUpdateService.Seed = seed.Value;
        else
            colorUpdateService.ForgetSeed();
    }
}
