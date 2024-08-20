using System.Threading.Tasks;
using LiftLog.Ui.Models;
using LiftLog.Ui.Services;
using MaterialColorUtilities.Schemes;
using Microsoft.Maui.ApplicationModel;
using Microsoft.Maui.Storage;

namespace LiftLog.Maui.Services;

public class AppThemeProvider(AppColorService colorUpdateService) : IThemeProvider
{
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
            _ => throw new ArgumentOutOfRangeException(
                nameof(themePreference),
                themePreference,
                null
            ),
        };
        if (seed is not null)
        {
            colorUpdateService.EnableDynamicColor = false;
            Preferences.Default.Set("EnableDynamicColor", false);
            colorUpdateService.Seed = seed.Value;
        }
        else
        {
            colorUpdateService.ForgetSeed();
            colorUpdateService.EnableDynamicColor = true;
            Preferences.Default.Set("EnableDynamicColor", true);
        }

        return Task.CompletedTask;
    }

    public uint? GetSeed()
    {
        return colorUpdateService.EnableDynamicColor ? null : colorUpdateService.Seed;
    }

    public ThemePreference GetThemePreference()
    {
        return Microsoft.Maui.Controls.Application.Current!.UserAppTheme switch
        {
            AppTheme.Unspecified => ThemePreference.FollowSystem,
            AppTheme.Light => ThemePreference.Light,
            AppTheme.Dark => ThemePreference.Dark,
            _ => throw new ArgumentOutOfRangeException(
                nameof(Microsoft.Maui.Controls.Application.Current.UserAppTheme),
                Microsoft.Maui.Controls.Application.Current.UserAppTheme,
                null
            ),
        };
    }

    public AppColorScheme<uint> GetColorScheme()
    {
        return colorUpdateService.SchemeInt;
    }
}
