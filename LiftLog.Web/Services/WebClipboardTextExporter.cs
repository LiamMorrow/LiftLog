using System.Text;
using BlazorDownloadFile;
using LiftLog.Ui.Services;

namespace LiftLog.Web.Services;

public class WebClipboardTextExporter : ITextExporter
{
    private readonly IBlazorDownloadFileService _downloadFileService;

    public WebClipboardTextExporter(IBlazorDownloadFileService downloadFileService)
    {
        _downloadFileService = downloadFileService;
    }

    public async Task ExportTextAsync(string text)
    {
        await _downloadFileService.DownloadFileFromText(
            fileName: "liftlog.export.json",
            plainText: text,
            encoding: Encoding.UTF8,
            contentType: "text/plain",
            encoderShouldEmitIdentifier: false
        );
    }

    public Task<string> ImportTextAsync()
    {
        // Blazor does not support clipboard access
        return Task.FromResult("");
    }
}
