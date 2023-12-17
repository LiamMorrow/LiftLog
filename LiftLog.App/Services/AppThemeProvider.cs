using System.Threading.Tasks;
using LiftLog.Ui.Services;
using MaterialColorUtilities.Schemes;
using Microsoft.Maui.ApplicationModel;
using Microsoft.Maui.Storage;

namespace LiftLog.App.Services;

public class AppThemeProvider(ThemeColorUpdateService colorUpdateService) : IThemeProvider
{
    public ValueTask<Scheme<uint>> GetColorSchemeAsync() =>
        ValueTask.FromResult(colorUpdateService.SchemeInt);

    public event EventHandler SeedChanged
    {
        add => colorUpdateService.SeedChanged += value;
        remove => colorUpdateService.SeedChanged -= value;
    }

    public event EventHandler? InsetsChanged;

    public string SystemSafeInsetTop { get; set; } = "env(safe-area-inset-top, 0px)";

    public string SystemSafeInsetBottom { get; set; } = "env(safe-area-inset-bottom, 0px)";

    public void NotifyInsetsChanged() => InsetsChanged?.Invoke(this, EventArgs.Empty);

    public Task SetSeedColor(uint? seed, ThemePreference themePreference)
    {
        if (Microsoft.Maui.Controls.Application.Current is null)
        {
            return Task.CompletedTask;
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
        {
            colorUpdateService.EnableDynamicColor = false;
            Preferences.Default.Set("EnableDynamicColor", false);
            colorUpdateService.Seed = seed.Value;
        }
        else
        {
            colorUpdateService.EnableDynamicColor = true;
            colorUpdateService.ForgetSeed();
        }
        return Task.CompletedTask;
    }

    public uint? GetSeed()
    {
        return colorUpdateService.EnableDynamicColor ? null : colorUpdateService.Seed;
    }

    public ThemePreference GetThemePreference()
    {
        return Microsoft.Maui.Controls.Application.Current.UserAppTheme switch
        {
            AppTheme.Unspecified => ThemePreference.FollowSystem,
            AppTheme.Light => ThemePreference.Light,
            AppTheme.Dark => ThemePreference.Dark,
            _
                => throw new ArgumentOutOfRangeException(
                    nameof(Microsoft.Maui.Controls.Application.Current.UserAppTheme),
                    Microsoft.Maui.Controls.Application.Current.UserAppTheme,
                    null
                )
        };
    }
}
