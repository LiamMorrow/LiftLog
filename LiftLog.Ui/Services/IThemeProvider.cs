using MaterialColorUtilities.Schemes;

namespace LiftLog.Ui.Services;

public interface IThemeProvider
{
    Scheme<uint> GetColorScheme();

    event EventHandler SeedChanged;
}
