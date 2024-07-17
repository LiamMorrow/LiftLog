using System.IO.Compression;
using BlazorDownloadFile;
using LiftLog.Ui.Services;

namespace LiftLog.Web.Services;

public class WebExporter(IBlazorDownloadFileService downloadFileService) : IExporter
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
        throw new NotImplementedException();
    }
}
