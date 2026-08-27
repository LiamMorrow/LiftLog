using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using Amazon.S3;
using Amazon.S3.Transfer;
using Microsoft.Extensions.Options;

namespace LiftLog.Api.Service.Backup;

public record S3BackupSinkOptions : IValidatableObject
{
    [Required]
    [MinLength(1)]
    public string BucketName { get; init; } = string.Empty;

    public string? KeyPrefix { get; init; }

    /// <summary>Endpoint of an S3 compatible service (R2, MinIO). Unset means AWS S3.</summary>
    public string? ServiceUrl { get; init; }

    public string? Region { get; init; }

    public bool ForcePathStyle { get; init; }

    /// <summary>Leave unset to use the ambient AWS credential chain.</summary>
    public string? AccessKeyId { get; init; }

    public string? SecretAccessKey { get; init; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (string.IsNullOrWhiteSpace(ServiceUrl) && string.IsNullOrWhiteSpace(Region))
        {
            yield return new ValidationResult(
                $"{nameof(Region)} is required unless {nameof(ServiceUrl)} is configured.",
                [nameof(Region)]
            );
        }

        if (string.IsNullOrWhiteSpace(AccessKeyId) != string.IsNullOrWhiteSpace(SecretAccessKey))
        {
            yield return new ValidationResult(
                $"{nameof(AccessKeyId)} and {nameof(SecretAccessKey)} must be configured together.",
                [nameof(AccessKeyId), nameof(SecretAccessKey)]
            );
        }
    }
}

public partial class S3BackupSink : IBackupSink
{
    private readonly TransferUtility _transferUtility;
    private readonly string _bucketName;
    private readonly string? _keyPrefix;

    public S3BackupSink(IAmazonS3 s3Client, IOptions<S3BackupSinkOptions> options)
    {
        _transferUtility = new TransferUtility(s3Client);
        _bucketName = options.Value.BucketName;
        _keyPrefix = options.Value.KeyPrefix;
    }

    public async Task UploadBackupAsync(string backupName, Stream stream)
    {
        var key = ResolveObjectKey(_keyPrefix, backupName);

        await _transferUtility.UploadAsync(
            new TransferUtilityUploadRequest
            {
                BucketName = _bucketName,
                Key = key,
                InputStream = new CallerOwnedStream(stream),
                ContentType = "application/gzip",
            }
        );
    }

    public static string ResolveObjectKey(string? configuredKeyPrefix, string backupName)
    {
        if (!SafeBackupName().IsMatch(backupName))
        {
            throw new ArgumentException(
                $"Backup name is not a valid object key segment: '{backupName}'",
                nameof(backupName)
            );
        }

        var prefix = configuredKeyPrefix?.Trim().Trim('/');
        var fileName = $"{DateTimeOffset.UtcNow:O}.liftlogbackup.gz";

        return string.IsNullOrEmpty(prefix)
            ? $"{backupName}/{fileName}"
            : $"{prefix}/{backupName}/{fileName}";
    }

    [GeneratedRegex(@"^[A-Za-z0-9](?:[A-Za-z0-9._-]{0,62}[A-Za-z0-9])?$")]
    private static partial Regex SafeBackupName();

    /// <summary>
    /// The transfer utility closes the stream it is given; the caller (a request body) owns this one.
    /// </summary>
    private sealed class CallerOwnedStream(Stream inner) : Stream
    {
        public override bool CanRead => inner.CanRead;
        public override bool CanSeek => inner.CanSeek;
        public override bool CanWrite => false;
        public override long Length => inner.Length;

        public override long Position
        {
            get => inner.Position;
            set => inner.Position = value;
        }

        public override int Read(byte[] buffer, int offset, int count) =>
            inner.Read(buffer, offset, count);

        public override Task<int> ReadAsync(
            byte[] buffer,
            int offset,
            int count,
            CancellationToken cancellationToken
        ) => inner.ReadAsync(buffer, offset, count, cancellationToken);

        public override ValueTask<int> ReadAsync(
            Memory<byte> buffer,
            CancellationToken cancellationToken = default
        ) => inner.ReadAsync(buffer, cancellationToken);

        public override long Seek(long offset, SeekOrigin origin) => inner.Seek(offset, origin);

        public override void Flush() { }

        public override void SetLength(long value) => throw new NotSupportedException();

        public override void Write(byte[] buffer, int offset, int count) =>
            throw new NotSupportedException();

        protected override void Dispose(bool disposing) { }

        public override ValueTask DisposeAsync() => ValueTask.CompletedTask;
    }
}
