using MaterialColorUtilities.Schemes;

namespace LiftLog.Ui.Services;

public interface IThemeProvider
{
    ValueTask<Scheme<uint>> GetColorSchemeAsync();

    /// <summary>
    /// Set the seed for the theme color generator.
    /// This should persist between app restarts
    /// </summary>
    /// <param name="seed">A color in ARGB format, that is used as seed when creating the color scheme. When null - follow system color (android only)</param>
    public Task SetSeedColor(uint? seed, ThemePreference themePreference);

    public uint? GetSeed();

    public ThemePreference GetThemePreference();

    event EventHandler SeedChanged;
}

public enum ThemePreference
{
    FollowSystem,
    Light,
    Dark
}
