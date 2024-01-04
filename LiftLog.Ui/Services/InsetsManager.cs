namespace LiftLog.Ui.Services;

public class InsetsManager
{
    public event EventHandler? InsetsChanged;

    public string SystemSafeInsetTop { get; set; } = "env(safe-area-inset-top, 0px)";

    public string SystemSafeInsetBottom { get; set; } = "env(safe-area-inset-bottom, 0px)";

    public void NotifyInsetsChanged() => InsetsChanged?.Invoke(this, EventArgs.Empty);
}
