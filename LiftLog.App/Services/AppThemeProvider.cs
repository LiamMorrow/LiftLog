using LiftLog.Ui.Services;
using MaterialColorUtilities.Schemes;

namespace LiftLog.App.Services;

public class AppThemeProvider : IThemeProvider
{
    private readonly ThemeColorUpdateService _colorUpdateService;

    public AppThemeProvider(ThemeColorUpdateService colorUpdateService)
    {
        _colorUpdateService = colorUpdateService;
    }

    public Scheme<uint> GetColorScheme() => _colorUpdateService.SchemeInt;

    public event EventHandler SeedChanged
    {
        add => _colorUpdateService.SeedChanged += value;
        remove => _colorUpdateService.SeedChanged -= value;
    }
}
