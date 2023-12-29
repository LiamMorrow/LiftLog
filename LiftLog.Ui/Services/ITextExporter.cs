namespace LiftLog.Ui.Services;

public interface IExporter
{
    Task ExportBytesAsync(byte[] bytes);
    Task<byte[]> ImportBytesAsync();
}
