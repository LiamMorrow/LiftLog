using LiftLog.Api.Service.Backup;

namespace LiftLog.Tests.Api.Integration.Helpers;

public sealed record RecordedBackup(string BackupName, byte[] Contents);

public sealed class RecordingBackupSink : IBackupSink
{
    private readonly List<RecordedBackup> _uploads = [];

    public IReadOnlyList<RecordedBackup> Uploads
    {
        get
        {
            lock (_uploads)
            {
                return [.. _uploads];
            }
        }
    }

    public async Task UploadBackupAsync(string backupName, Stream stream)
    {
        using var buffer = new MemoryStream();
        await stream.CopyToAsync(buffer);
        lock (_uploads)
        {
            _uploads.Add(new RecordedBackup(backupName, buffer.ToArray()));
        }
    }
}
