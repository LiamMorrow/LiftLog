namespace LiftLog.Ui.Services;

public interface IBackupRestoreService
{
    Task ExportBytesAsync(byte[] bytes);
    Task<byte[]> ImportBytesAsync();
}
