using System.Diagnostics.CodeAnalysis;
using LiftLog.Ui.Services;
using MaterialColorUtilities.Palettes;
using MaterialColorUtilities.Schemes;
using Microsoft.JSInterop;
using RealGoodApps.BlazorJavascript.Interop;
using RealGoodApps.BlazorJavascript.Interop.Extensions;

namespace LiftLog.Web.Services;

public class WebThemeProvider : IThemeProvider
{
    private Scheme<uint> _scheme;
    private uint? _seed;
    private readonly IJSRuntime jsRuntime;

    public WebThemeProvider(IJSRuntime jsRuntime)
    {
        this.jsRuntime = jsRuntime;
        SetSeedColor(0xF44336, ThemePreference.FollowSystem);
    }

    public Scheme<uint> GetColorScheme() => _scheme;

    [MemberNotNull(nameof(_scheme))]
    public void SetSeedColor(uint? seed, ThemePreference themePreference)
    {
        _seed = seed;
        var _corePalette = new CorePalette();

        _corePalette.Fill(seed ?? 0xF44336);

        if (jsRuntime is not IJSInProcessRuntime jsInProcessRuntime)
        {
            throw new InvalidCastException("The JS runtime must be in-process.");
        }

        BlazorJavascriptInitialization.Initialize(jsInProcessRuntime);

        var window = jsInProcessRuntime.GetWindow()!;
        var windowThemePrefersDark = window
            .matchMedia(jsInProcessRuntime.CreateString("(prefers-color-scheme: dark)"))
            .matches
            .ConvertToValue<bool>();

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
