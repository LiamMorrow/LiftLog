using LiftLog.Ui.Services;
using MaterialColorUtilities.Schemes;

namespace LiftLog.App.Services;

public class AppThemeProvider(ThemeColorUpdateService colorUpdateService) : IThemeProvider
{
    public Scheme<uint> GetColorScheme() => colorUpdateService.SchemeInt;

    public event EventHandler SeedChanged
    {
        add => colorUpdateService.SeedChanged += value;
        remove => colorUpdateService.SeedChanged -= value;
    }

    public event EventHandler InsetsChanged;

    public string SystemSafeInsetTop { get; set; } = "env(safe-area-inset-top, 0px)";

    public string SystemSafeInsetBottom { get; set; } = "env(safe-area-inset-bottom, 0px)";

    public void NotifyInsetsChanged() => InsetsChanged?.Invoke(this, EventArgs.Empty);
}
