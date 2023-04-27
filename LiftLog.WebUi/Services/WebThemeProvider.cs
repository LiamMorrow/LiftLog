using LiftLog.Ui.Services;
using MaterialColorUtilities.Palettes;
using MaterialColorUtilities.Schemes;

namespace LiftLog.WebUi.Services;

public class WebThemeProvider : IThemeProvider
{
    private readonly CorePalette _corePalette;
    private readonly Scheme<uint> _scheme;

    public WebThemeProvider()
    {
        _corePalette = new();
        _corePalette.Fill(0xF44336);
        _scheme = new LightSchemeMapper().Map(_corePalette);
    }

    public Scheme<uint> GetColorScheme() => _scheme;

    public event EventHandler SeedChanged
    {
        add { }
        remove { }
    }
}