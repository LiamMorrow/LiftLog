namespace LiftLog.Ui.Services;

public interface IFileExportService
{
    Task ExportBytesAsync(string fileName, byte[] bytes, string contentType);
}
