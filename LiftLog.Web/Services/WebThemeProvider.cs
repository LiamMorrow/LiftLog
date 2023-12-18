using System.Diagnostics.CodeAnalysis;
using LiftLog.Ui.Services;
using MaterialColorUtilities.Palettes;
using MaterialColorUtilities.Schemes;
using Microsoft.JSInterop;
using RealGoodApps.BlazorJavascript.Interop;
using RealGoodApps.BlazorJavascript.Interop.Extensions;

namespace LiftLog.Web.Services;

public class WebThemeProvider(IJSRuntime jsRuntime, IPreferenceStore preferenceStore)
    : IThemeProvider
{
    const uint DEFAULT_SEED = 0xF44336;

    private Scheme<uint>? _scheme;
    private uint? _seed;

    public async ValueTask<Scheme<uint>> GetColorSchemeAsync() =>
        _scheme ??= await GetInitialColorScheme();

    private async ValueTask<Scheme<uint>> GetInitialColorScheme()
    {
        var seedAndPref = await Task.WhenAll(
            preferenceStore.GetItemAsync("THEME_SEED").AsTask(),
            preferenceStore.GetItemAsync("THEME_PREF").AsTask()
        );
        var seed = seedAndPref[0] ?? "null";
        var pref = seedAndPref[1] ?? "FollowSystem";
        await SetSeedColor(
            seed == "null" ? null : uint.Parse(seed, System.Globalization.NumberStyles.HexNumber),
            Enum.Parse<ThemePreference>(pref)
        );
        return _scheme;
    }

    [MemberNotNull(nameof(_scheme))]
    public async Task SetSeedColor(uint? seed, ThemePreference themePreference)
    {
        _seed = seed;
        var _corePalette = new CorePalette();

        _corePalette.Fill(seed ?? DEFAULT_SEED);

        if (jsRuntime is not IJSInProcessRuntime jsInProcessRuntime)
        {
            throw new InvalidCastException("The JS runtime must be in-process.");
        }

        BlazorJavascriptInitialization.Initialize(jsInProcessRuntime);

        var window = jsInProcessRuntime.GetWindow()!;
        var windowThemePrefersDark = window
            .matchMedia(jsInProcessRuntime.CreateString("(prefers-color-scheme: dark)"))
            .matches.ConvertToValue<bool>();

        Scheme<uint> Light() => new LightSchemeMapper().Map(_corePalette);
        Scheme<uint> Dark() => new DarkSchemeMapper().Map(_corePalette);
        _scheme = themePreference switch
        {
            ThemePreference.FollowSystem => windowThemePrefersDark ? Dark() : Light(),
            ThemePreference.Light => Light(),
            ThemePreference.Dark => Dark(),
            _
                => throw new ArgumentOutOfRangeException(
                    nameof(themePreference),
                    themePreference,
                    null
                )
        };
        SeedChanged?.Invoke(this, EventArgs.Empty);
        await Task.WhenAll(
            preferenceStore.SetItemAsync("THEME_SEED", seed?.ToString("X") ?? "null").AsTask(),
            preferenceStore.SetItemAsync("THEME_PREF", themePreference.ToString()).AsTask()
        );
    }

    public uint? GetSeed()
    {
        return _seed;
    }

    public ThemePreference GetThemePreference()
    {
        return ThemePreference.FollowSystem;
    }

    public event EventHandler? SeedChanged;
    public event EventHandler? InsetsChanged
    {
        add { }
        remove { }
    }

    public string SystemSafeInsetTop => "0px";

    public string SystemSafeInsetBottom => "0px";
}
