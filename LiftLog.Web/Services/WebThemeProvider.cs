using System.Diagnostics.CodeAnalysis;
using Fluxor;
using LiftLog.Ui.Models;
using LiftLog.Ui.Services;
using LiftLog.Ui.Store.App;
using Microsoft.JSInterop;
using RealGoodApps.BlazorJavascript.Interop;
using RealGoodApps.BlazorJavascript.Interop.Extensions;

namespace LiftLog.Web.Services;

public class WebThemeProvider : IThemeProvider
{
    const uint DEFAULT_SEED = 0x00FF00;
    private readonly IJSRuntime jsRuntime;
    private readonly IPreferenceStore preferenceStore;
    private readonly IDispatcher dispatcher;
    private AppColorScheme<uint>? _scheme;
    private uint? _seed;

    public WebThemeProvider(
        IJSRuntime jsRuntime,
        IPreferenceStore preferenceStore,
        IDispatcher dispatcher
    )
    {
        this.jsRuntime = jsRuntime;
        this.preferenceStore = preferenceStore;
        this.dispatcher = dispatcher;
        _ = GetInitialColorScheme();
    }

    private async Task GetInitialColorScheme()
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
    }

    [MemberNotNull(nameof(_scheme))]
    public async Task SetSeedColor(uint? seed, ThemePreference themePreference)
    {
        _seed = seed;
        var _corePalette = new AppCorePalette();

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

        AppColorScheme<uint> Light() => new AppLightSchemeMapper().Map(_corePalette);
        AppColorScheme<uint> Dark() => new AppDarkSchemeMapper().Map(_corePalette);
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
        dispatcher.Dispatch(
            new ThemeColorUpdatedAction(
                _scheme,
                themePreference == ThemePreference.Dark
                    || (windowThemePrefersDark && themePreference == ThemePreference.FollowSystem)
            )
        );
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

    public AppColorScheme<uint> GetColorScheme()
    {
        return _scheme ?? new AppColorScheme<uint>();
    }
}
