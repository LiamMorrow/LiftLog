using LiftLog.Ui.Services;

namespace LiftLog.Maui.Services;

public class MauiFileExportService(IShare share) : IFileExportService
{
    public async Task ExportBytesAsync(string fileName, byte[] bytes, string contentType)
    {
        string file = Path.Combine(FileSystem.CacheDirectory, fileName);

        using FileStream stream = File.Create(file);
        await stream.WriteAsync(bytes);

        await share.RequestAsync(
            new ShareFileRequest { Title = "Export Data", File = new ShareFile(file) }
        );
    }
}
