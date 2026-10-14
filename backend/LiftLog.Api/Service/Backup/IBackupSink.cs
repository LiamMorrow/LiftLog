namespace LiftLog.Api.Service.Backup;

public interface IBackupSink
{
    Task UploadBackupAsync(string backupName, Stream stream);
}
