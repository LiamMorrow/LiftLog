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

    public event EventHandler InsetsChanged;

    public string SystemSafeInsetTop { get; set; } = "env(safe-area-inset-top, 0px)";

    public string SystemSafeInsetBottom { get; set; } = "env(safe-area-inset-bottom, 0px)";

    public void NotifyInsetsChanged() => InsetsChanged?.Invoke(this, EventArgs.Empty);
}
