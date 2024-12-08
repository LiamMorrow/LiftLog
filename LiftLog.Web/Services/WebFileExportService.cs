using BlazorDownloadFile;
using LiftLog.Ui.Services;

namespace LiftLog.Web.Services;

public class WebFileExportService(IBlazorDownloadFileService blazorDownloadFileService)
    : IFileExportService
{
    public async Task ExportBytesAsync(string fileName, byte[] bytes, string contentType)
    {
        await blazorDownloadFileService.DownloadFile(
            fileName: fileName,
            bytes: bytes,
            contentType: contentType
        );
    }
}
