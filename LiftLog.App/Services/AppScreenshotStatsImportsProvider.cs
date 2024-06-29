#if DEBUG
using LiftLog.Ui.Pages.Screenshot;

namespace LiftLog.App.Services;

public class AppScreenshotStatsImportsProvider : IScreenshotStatsImportsProvider
{
    public async Task<Stream> GetImportBytesAsync()
    {
        var result = await FileSystem.OpenAppPackageFileAsync(
            "wwwroot/_content/LiftLog.Ui/export.liftlogbackup.gz"
        );
        return result;
    }
}

#endif
