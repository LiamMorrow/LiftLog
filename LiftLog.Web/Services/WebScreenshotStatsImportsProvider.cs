#if DEBUG
using LiftLog.Ui.Pages.Screenshot;

namespace LiftLog.Ui.Services;

public class WebScreenshotStatsImportsProvider(HttpClient httpClient)
    : IScreenshotStatsImportsProvider
{
    public async Task<Stream> GetImportBytesAsync()
    {
        var imported = await httpClient.GetAsync("/_content/LiftLog.Ui/export.liftlogbackup.gz");
        return await imported.Content.ReadAsStreamAsync();
    }
}

#endif
