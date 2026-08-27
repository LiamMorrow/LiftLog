using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Options;

namespace LiftLog.Api.Service.Backup;

public record FileStorageBackupSinkOptions
{
    [Required]
    [MinLength(1)]
    public string BackupDirectory { get; init; } = string.Empty;
}

public partial class FileStorageBackupSink(IOptions<FileStorageBackupSinkOptions> options)
    : IBackupSink
{
    private static readonly StringComparison PathComparison =
        OperatingSystem.IsWindows() || OperatingSystem.IsMacOS()
            ? StringComparison.OrdinalIgnoreCase
            : StringComparison.Ordinal;

    private readonly string _root = RequireExistingDirectory(options.Value.BackupDirectory);

    public async Task UploadBackupAsync(string backupName, Stream stream)
    {
        var backupDirectory = ResolveBackupDirectory(_root, backupName);

        Directory.CreateDirectory(backupDirectory);

        using var file = File.OpenWrite(
            Path.Combine(backupDirectory, $"{DateTimeOffset.UtcNow:O}.liftlogbackup.gz")
        );

        await stream.CopyToAsync(file);
    }

    internal static string RequireExistingDirectory(string configuredRoot)
    {
        if (string.IsNullOrWhiteSpace(configuredRoot) || !Directory.Exists(configuredRoot))
        {
            throw new DirectoryNotFoundException(
                $"Configured backup directory is not an existing directory: '{configuredRoot}'"
            );
        }

        return Path.TrimEndingDirectorySeparator(Path.GetFullPath(configuredRoot));
    }

    public static string ResolveBackupDirectory(string configuredRoot, string backupName)
    {
        if (!SafeBackupName().IsMatch(backupName))
        {
            throw new ArgumentException(
                $"Backup name is not a valid directory name: '{backupName}'",
                nameof(backupName)
            );
        }

        var root = Path.TrimEndingDirectorySeparator(Path.GetFullPath(configuredRoot));
        var resolved = Path.GetFullPath(Path.Combine(root, backupName));

        if (!resolved.StartsWith(root + Path.DirectorySeparatorChar, PathComparison))
        {
            throw new ArgumentException(
                $"Backup name escapes the backup directory: '{backupName}'",
                nameof(backupName)
            );
        }

        return resolved;
    }

    [GeneratedRegex(@"^[A-Za-z0-9](?:[A-Za-z0-9._-]{0,62}[A-Za-z0-9])?$")]
    private static partial Regex SafeBackupName();
}
