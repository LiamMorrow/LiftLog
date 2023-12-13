using System.IO.Compression;
using LiftLog.Ui.Services;

namespace LiftLog.App.Services;

public class MauiShareTextExporter(IShare share, IFilePicker filePicker) : ITextExporter
{
    public async Task ExportTextAsync(string text)
    {
        string fileName = "liftlog-export.json.gz";
        string file = Path.Combine(FileSystem.CacheDirectory, fileName);

        using (FileStream stream = File.Create(file))
        using (GZipStream gzip = new(stream, CompressionMode.Compress))
        using (StreamWriter writer = new(gzip))
        {
            await writer.WriteAsync(text);
        }
        await share.RequestAsync(
            new ShareFileRequest { Title = "Export Data", File = new ShareFile(file) }
        );
    }

    public async Task<string> ImportTextAsync()
    {
        var file = await filePicker.PickAsync();

        if (file == null)
        {
            return "";
        }

        using FileStream stream = File.OpenRead(file.FullPath);
        using GZipStream gzip = new(stream, CompressionMode.Decompress);
        using StreamReader reader = new(gzip);
        return await reader.ReadToEndAsync();
    }
}
