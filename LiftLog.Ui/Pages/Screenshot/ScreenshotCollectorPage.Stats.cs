#if DEBUG
using System.IO.Compression;
using LiftLog.Lib.Models;
using LiftLog.Ui.Store.App;
using LiftLog.Ui.Store.CurrentSession;
using LiftLog.Ui.Store.Settings;
using Microsoft.AspNetCore.Components;

namespace LiftLog.Ui.Pages.Screenshot;

public partial class ScreenshotCollectorPage
{
    [Inject]
    public HttpClient HttpClient { get; set; } = null!;

    [Inject]
    public IScreenshotStatsImportsProvider ScreenshotStatsImportsProvider { get; set; } = null!;

    private async Task HandleStatsScreenshotCollection()
    {
        var imported = await ScreenshotStatsImportsProvider.GetImportBytesAsync();
        using GZipStream gzip = new(imported, CompressionMode.Decompress);
        using MemoryStream memoryStream = new();
        await gzip.CopyToAsync(memoryStream);
        var bytes = memoryStream.ToArray();
        Dispatcher.Dispatch(new ImportDataBytesAction(bytes));
        var latestSession = await ProgressRepository.GetOrderedSessions().FirstAsync();
        var dateDiffToNow = (
            DateTime.Now - latestSession.Date.ToDateTime(TimeOnly.FromDateTime(DateTime.Now))
        ).Days;

        var remappedToTodaySessions = await ProgressRepository
            .GetOrderedSessions()
            .Select(session => session with { Date = session.Date.AddDays(dateDiffToNow) })
            .ToListAsync();

        await ProgressRepository.SaveCompletedSessionsAsync(remappedToTodaySessions);

        Dispatcher.Dispatch(new SetShowBodyweightAction(false));
        Dispatcher.Dispatch(new NavigateAction("/stats"));
    }
}

public interface IScreenshotStatsImportsProvider
{
    Task<Stream> GetImportBytesAsync();
}
#endif
