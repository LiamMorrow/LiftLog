using LiftLog.Ui.Services;
using MaterialColorUtilities.Palettes;
using MaterialColorUtilities.Schemes;
using Microsoft.JSInterop;
using RealGoodApps.BlazorJavascript.Interop;
using RealGoodApps.BlazorJavascript.Interop.Extensions;

namespace LiftLog.WebUi.Services;

public class WebThemeProvider : IThemeProvider
{
    private readonly CorePalette _corePalette;
    private readonly Scheme<uint> _scheme;

    public WebThemeProvider(IJSRuntime jsRuntime)
    {
        _corePalette = new();
        _corePalette.Fill(0xF44336);


        if (jsRuntime is not IJSInProcessRuntime jsInProcessRuntime)
        {
            throw new InvalidCastException("The JS runtime must be in-process.");
        }

        BlazorJavascriptInitialization.Initialize(jsInProcessRuntime);
        var window = jsInProcessRuntime.GetWindow()!;
        _scheme = !window.matchMedia(jsInProcessRuntime.CreateString("(prefers-color-scheme: dark)")).matches
            .ConvertToValue<bool>()
            ? new DarkSchemeMapper().Map(_corePalette)
            : new LightSchemeMapper().Map(_corePalette);
    }

    public Scheme<uint> GetColorScheme() => _scheme;

    public event EventHandler SeedChanged
    {
        add { }
        remove { }
    }
}
