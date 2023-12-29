using System.IO.Compression;
using LiftLog.Ui.Services;

namespace LiftLog.App.Services;

public class MauiShareExporter(IShare share, IFilePicker filePicker) : IExporter
{
    public async Task ExportBytesAsync(byte[] bytes)
    {
        string fileName = "export.liftlogbackup.gz";
        string file = Path.Combine(FileSystem.CacheDirectory, fileName);

        using (FileStream stream = File.Create(file))
        using (GZipStream gzip = new(stream, CompressionMode.Compress))
            await gzip.WriteAsync(bytes);

        await share.RequestAsync(
            new ShareFileRequest { Title = "Export Data", File = new ShareFile(file) }
        );
    }

    public async Task<byte[]> ImportBytesAsync()
    {
        var file = await filePicker.PickAsync();

        if (file == null)
        {
            return Array.Empty<byte>();
        }

        using FileStream stream = File.OpenRead(file.FullPath);
        using GZipStream gzip = new(stream, CompressionMode.Decompress);
        using MemoryStream memoryStream = new();
        await gzip.CopyToAsync(memoryStream);
        return memoryStream.ToArray();
    }
}
