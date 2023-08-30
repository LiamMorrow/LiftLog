using MaterialColorUtilities.Schemes;

namespace LiftLog.Ui.Services;

public interface IThemeProvider
{
    Scheme<uint> GetColorScheme();

    bool IsAndroid { get; }

    event EventHandler SeedChanged;
}
