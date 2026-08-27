using System.Text;
using LiftLog.Api.Service.Backup;
using Microsoft.Extensions.Options;

namespace LiftLog.Tests.Api.Unit;

public class FileStorageBackupSinkTests
{
    private static FileStorageBackupSink SinkFor(string root) =>
        new(Options.Create(new FileStorageBackupSinkOptions { BackupDirectory = root }));

    [Test]
    public async Task Constructor_ThrowsWhenBackupDirectoryDoesNotExist()
    {
        var missing = Path.Combine(Path.GetTempPath(), $"liftlog-missing-{Guid.NewGuid()}");

        await Assert.That(() => SinkFor(missing)).Throws<DirectoryNotFoundException>();
    }

    [Test]
    [Arguments("")]
    [Arguments("   ")]
    public async Task Constructor_ThrowsWhenBackupDirectoryIsBlank(string root)
    {
        await Assert.That(() => SinkFor(root)).Throws<DirectoryNotFoundException>();
    }

    [Test]
    public async Task Constructor_ThrowsWhenBackupDirectoryIsAFile()
    {
        var parent = Directory.CreateTempSubdirectory();
        try
        {
            var file = Path.Combine(parent.FullName, "not-a-directory");
            await File.WriteAllTextAsync(file, "x");

            await Assert.That(() => SinkFor(file)).Throws<DirectoryNotFoundException>();
        }
        finally
        {
            parent.Delete(recursive: true);
        }
    }

    [Test]
    public async Task Constructor_SucceedsWhenBackupDirectoryExists()
    {
        var root = Directory.CreateTempSubdirectory();
        try
        {
            await Assert.That(() => SinkFor(root.FullName)).ThrowsNothing();
        }
        finally
        {
            root.Delete(recursive: true);
        }
    }

    [Test]
    public async Task UploadBackupAsync_WritesBodyUnderNamedDirectory()
    {
        var root = Directory.CreateTempSubdirectory();
        try
        {
            using var body = new MemoryStream(Encoding.UTF8.GetBytes("backup-bytes"));

            await SinkFor(root.FullName).UploadBackupAsync("default", body);

            var written = Directory.GetFiles(
                Path.Combine(root.FullName, "default"),
                "*.liftlogbackup.gz"
            );
            await Assert.That(written.Length).IsEqualTo(1);
            await Assert.That(await File.ReadAllTextAsync(written[0])).IsEqualTo("backup-bytes");
        }
        finally
        {
            root.Delete(recursive: true);
        }
    }

    [Test]
    [Arguments("..")]
    [Arguments(".")]
    [Arguments("../evil")]
    [Arguments("../../etc/passwd")]
    [Arguments("default/../../evil")]
    [Arguments("..\\evil")]
    [Arguments("nested/name")]
    [Arguments("nested\\name")]
    [Arguments("/etc/passwd")]
    [Arguments("/absolute")]
    [Arguments("C:\\Windows\\Temp")]
    [Arguments(".hidden")]
    [Arguments("trailing.")]
    [Arguments("trailing ")]
    [Arguments(" leading")]
    [Arguments("")]
    [Arguments("   ")]
    [Arguments("name\0byte")]
    [Arguments("na*me")]
    [Arguments("na:me")]
    public async Task ResolveBackupDirectory_RejectsUnsafeName(string backupName)
    {
        await Assert
            .That(() => FileStorageBackupSink.ResolveBackupDirectory("/srv/backups", backupName))
            .Throws<ArgumentException>();
    }

    [Test]
    [Arguments("default")]
    [Arguments("a")]
    [Arguments("user-1")]
    [Arguments("user_1")]
    [Arguments("user.name")]
    [Arguments("A1")]
    public async Task ResolveBackupDirectory_AcceptsSafeNameAndStaysInsideRoot(string backupName)
    {
        var root = Path.GetFullPath("/srv/backups");

        var resolved = FileStorageBackupSink.ResolveBackupDirectory(root, backupName);

        await Assert.That(resolved).IsEqualTo(Path.Combine(root, backupName));
    }

    [Test]
    public async Task ResolveBackupDirectory_DoesNotTreatSiblingPrefixAsInside()
    {
        var root = Path.GetFullPath("/srv/backups");

        var resolved = FileStorageBackupSink.ResolveBackupDirectory(root, "backups-evil");

        await Assert.That(resolved).StartsWith(root + Path.DirectorySeparatorChar);
    }

    [Test]
    public async Task UploadBackupAsync_WithEscapingName_WritesNothingOutsideRoot()
    {
        var parent = Directory.CreateTempSubdirectory();
        try
        {
            var root = Directory.CreateDirectory(Path.Combine(parent.FullName, "backups"));
            using var body = new MemoryStream(Encoding.UTF8.GetBytes("evil"));

            await Assert
                .That(async () =>
                    await SinkFor(root.FullName).UploadBackupAsync("../escaped", body)
                )
                .Throws<ArgumentException>();

            await Assert
                .That(Directory.GetFileSystemEntries(parent.FullName))
                .IsEquivalentTo([root.FullName]);
            await Assert.That(Directory.GetFileSystemEntries(root.FullName)).IsEmpty();
        }
        finally
        {
            parent.Delete(recursive: true);
        }
    }
}
