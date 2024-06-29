using System.IO.Compression;
using System.Text;
using BlazorDownloadFile;
using LiftLog.Ui.Services;

namespace LiftLog.Web.Services;

public class WebExporter(IBlazorDownloadFileService downloadFileService, HttpClient httpClient)
    : IExporter
{
    public async Task ExportBytesAsync(byte[] bytes)
    {
        using MemoryStream stream = new();
        using (GZipStream gzip = new(stream, CompressionLevel.SmallestSize))
        {
            await gzip.WriteAsync(bytes);
        }

        await downloadFileService.DownloadFile(
            fileName: "export.liftlogbackup.gz",
            bytes: stream.ToArray(),
            contentType: "application/octet-stream"
        );
    }

    public async Task<byte[]> ImportBytesAsync()
    {
        var imported = await httpClient.GetAsync("/_content/LiftLog.Ui/export.liftlogbackup.gz");
        using GZipStream gzip = new(imported.Content.ReadAsStream(), CompressionMode.Decompress);
        using MemoryStream memoryStream = new();
        await gzip.CopyToAsync(memoryStream);
        return memoryStream.ToArray();
    }
}
