using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;
using Amazon.S3;
using Amazon.S3.Model;
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

public partial class S3BackupSink(IAmazonS3 s3Client, IOptions<S3BackupSinkOptions> options)
    : IBackupSink
{
    private readonly string _bucketName = options.Value.BucketName;
    private readonly string? _keyPrefix = options.Value.KeyPrefix;
    private readonly bool _endpointUsesHttps = EndpointUsesHttps(options.Value.ServiceUrl);

    public async Task UploadBackupAsync(string backupName, Stream stream, long contentLength)
    {
        var key = ResolveObjectKey(_keyPrefix, backupName);

        var request = new PutObjectRequest
        {
            BucketName = _bucketName,
            Key = key,
            InputStream = stream,
            ContentType = "application/gzip",
            // S3 requires signing on when using http endpoints (don't)
            // We want to disable it when using https because it is not required and cloudflare doesn't support it
            DisablePayloadSigning = _endpointUsesHttps,
            AutoCloseStream = false,
        };
        request.Headers.ContentLength = contentLength;

        await s3Client.PutObjectAsync(request);
    }

    private static bool EndpointUsesHttps(string? serviceUrl) =>
        serviceUrl?.StartsWith("http://", StringComparison.OrdinalIgnoreCase) != true;

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
}
