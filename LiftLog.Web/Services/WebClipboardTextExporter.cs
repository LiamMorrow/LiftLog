using System.Text;
using BlazorDownloadFile;
using LiftLog.Ui.Services;

namespace LiftLog.Web.Services;

public class WebClipboardTextExporter : ITextExporter
{
    private readonly IBlazorDownloadFileService _downloadFileService;
    private readonly HttpClient httpClient;

    public WebClipboardTextExporter(
        IBlazorDownloadFileService downloadFileService,
        HttpClient httpClient
    )
    {
        _downloadFileService = downloadFileService;
        this.httpClient = httpClient;
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

    public async Task<string> ImportTextAsync()
    {
        var imported = await httpClient.GetAsync("/liftlog-export.json");
        return await imported.Content.ReadAsStringAsync();
    }
}
