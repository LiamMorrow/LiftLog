using System.Net;
using System.Security.Cryptography;
using System.Text;
using Amazon.S3;
using Amazon.S3.Model;
using LiftLog.Api.Service.Backup;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

namespace LiftLog.Tests.Api.Integration;

/// <summary>
/// Runs against the LocalStack S3 service from tests/docker-compose.yml.
/// </summary>
internal static class LocalStackS3
{
    public const string ServiceUrl = "http://localhost:4566";
    public const string AccessKeyId = "test";
    public const string SecretAccessKey = "test";
    public const string Region = "us-east-1";

    public static Dictionary<string, string?> Configuration(string bucketName, string? keyPrefix) =>
        new()
        {
            ["Backup:Sink"] = "S3",
            ["Backup:SinkOptions:BucketName"] = bucketName,
            ["Backup:SinkOptions:KeyPrefix"] = keyPrefix,
            ["Backup:SinkOptions:ServiceUrl"] = ServiceUrl,
            ["Backup:SinkOptions:Region"] = Region,
            ["Backup:SinkOptions:ForcePathStyle"] = "true",
            ["Backup:SinkOptions:AccessKeyId"] = AccessKeyId,
            ["Backup:SinkOptions:SecretAccessKey"] = SecretAccessKey,
        };

    public static IHost HostFor(string bucketName, string? keyPrefix = null)
    {
        var builder = Host.CreateEmptyApplicationBuilder(null);
        builder.Configuration.AddInMemoryCollection(Configuration(bucketName, keyPrefix));
        builder.AddBackupSink();

        return builder.Build();
    }

    public static async Task<string> CreateBucketAsync(IAmazonS3 client)
    {
        var bucketName = $"liftlog-test-{Guid.NewGuid():N}";
        await client.PutBucketAsync(bucketName);
        return bucketName;
    }

    public static async Task<List<S3Object>> ListAsync(IAmazonS3 client, string bucketName)
    {
        var response = await client.ListObjectsV2Async(
            new ListObjectsV2Request { BucketName = bucketName }
        );
        return response.S3Objects ?? [];
    }
}

public class S3BackupSinkIntegrationTests
{
    private const string FileSuffix = ".liftlogbackup.gz";

    private static async Task<(IHost Host, IAmazonS3 Client, string BucketName)> SetupAsync(
        string? keyPrefix = null
    )
    {
        string bucketName;
        using (var bootstrap = LocalStackS3.HostFor("bootstrap-not-used"))
        {
            bucketName = await LocalStackS3.CreateBucketAsync(
                bootstrap.Services.GetRequiredService<IAmazonS3>()
            );
        }

        var host = LocalStackS3.HostFor(bucketName, keyPrefix);
        return (host, host.Services.GetRequiredService<IAmazonS3>(), bucketName);
    }

    private static async Task<string> ReadObjectAsync(
        IAmazonS3 client,
        string bucketName,
        string key
    )
    {
        using var response = await client.GetObjectAsync(bucketName, key);
        using var reader = new StreamReader(response.ResponseStream);
        return await reader.ReadToEndAsync();
    }

    [Test]
    public async Task UploadBackupAsync_WritesBodyUnderBackupNamePrefix()
    {
        var (host, client, bucketName) = await SetupAsync();
        using var _ = host;
        using var body = new MemoryStream(Encoding.UTF8.GetBytes("backup-bytes"));

        await host.Services.GetRequiredService<IBackupSink>().UploadBackupAsync("default", body);

        var objects = await LocalStackS3.ListAsync(client, bucketName);
        await Assert.That(objects.Count).IsEqualTo(1);
        await Assert.That(objects[0].Key).StartsWith("default/");
        await Assert.That(objects[0].Key).EndsWith(FileSuffix);
        await Assert
            .That(await ReadObjectAsync(client, bucketName, objects[0].Key))
            .IsEqualTo("backup-bytes");
    }

    [Test]
    public async Task UploadBackupAsync_WithKeyPrefix_NestsUnderThatPrefix()
    {
        var (host, client, bucketName) = await SetupAsync(keyPrefix: "prod/nightly");
        using var _ = host;
        using var body = new MemoryStream(Encoding.UTF8.GetBytes("prefixed-bytes"));

        await host.Services.GetRequiredService<IBackupSink>().UploadBackupAsync("user.name", body);

        var objects = await LocalStackS3.ListAsync(client, bucketName);
        await Assert.That(objects.Count).IsEqualTo(1);
        await Assert.That(objects[0].Key).StartsWith("prod/nightly/user.name/");
    }

    [Test]
    public async Task UploadBackupAsync_AcceptsNonSeekableStreamOfUnknownLength()
    {
        var (host, client, bucketName) = await SetupAsync();
        using var _ = host;
        using var source = new MemoryStream(Encoding.UTF8.GetBytes("streamed-bytes"));
        using var body = new NonSeekableStream(source);

        await host.Services.GetRequiredService<IBackupSink>().UploadBackupAsync("default", body);

        var objects = await LocalStackS3.ListAsync(client, bucketName);
        await Assert
            .That(await ReadObjectAsync(client, bucketName, objects[0].Key))
            .IsEqualTo("streamed-bytes");
    }

    [Test]
    public async Task UploadBackupAsync_UploadsPayloadLargerThanOneMultipartPart()
    {
        var (host, client, bucketName) = await SetupAsync();
        using var _ = host;
        var payload = RandomNumberGenerator.GetBytes(12 * 1024 * 1024);
        using var source = new MemoryStream(payload);
        using var body = new NonSeekableStream(source);

        await host.Services.GetRequiredService<IBackupSink>().UploadBackupAsync("default", body);

        var objects = await LocalStackS3.ListAsync(client, bucketName);
        await Assert.That(objects[0].Size).IsEqualTo(payload.LongLength);

        using var response = await client.GetObjectAsync(bucketName, objects[0].Key);
        using var downloaded = new MemoryStream();
        await response.ResponseStream.CopyToAsync(downloaded);
        await Assert
            .That(SHA256.HashData(downloaded.ToArray()))
            .IsEquivalentTo(SHA256.HashData(payload));
    }

    [Test]
    public async Task UploadBackupAsync_DoesNotDisposeSuppliedStream()
    {
        var (host, _, _) = await SetupAsync();
        using var __ = host;
        using var source = new MemoryStream(Encoding.UTF8.GetBytes("keep-me-open"));
        using var body = new NonSeekableStream(source);

        await host.Services.GetRequiredService<IBackupSink>().UploadBackupAsync("default", body);

        await Assert.That(body.WasDisposed).IsFalse();
    }

    [Test]
    public async Task UploadBackupAsync_MarksObjectAsGzip()
    {
        var (host, client, bucketName) = await SetupAsync();
        using var _ = host;
        using var body = new MemoryStream(Encoding.UTF8.GetBytes("gzip-bytes"));

        await host.Services.GetRequiredService<IBackupSink>().UploadBackupAsync("default", body);

        var objects = await LocalStackS3.ListAsync(client, bucketName);
        var metadata = await client.GetObjectMetadataAsync(bucketName, objects[0].Key);
        await Assert.That(metadata.Headers.ContentType).IsEqualTo("application/gzip");
    }

    [Test]
    public async Task UploadBackupAsync_TwoBackupsForOneName_BothLandUnderThatName()
    {
        var (host, client, bucketName) = await SetupAsync();
        using var _ = host;
        var sink = host.Services.GetRequiredService<IBackupSink>();

        using (var first = new MemoryStream(Encoding.UTF8.GetBytes("first")))
        {
            await sink.UploadBackupAsync("default", first);
        }
        await Task.Delay(10);
        using (var second = new MemoryStream(Encoding.UTF8.GetBytes("second")))
        {
            await sink.UploadBackupAsync("default", second);
        }

        var objects = await LocalStackS3.ListAsync(client, bucketName);
        await Assert.That(objects.Count).IsEqualTo(2);
        await Assert.That(objects.All(x => x.Key.StartsWith("default/"))).IsTrue();
    }

    [Test]
    [Arguments("../escaped")]
    [Arguments("nested/name")]
    [Arguments("")]
    public async Task UploadBackupAsync_WithUnsafeName_ThrowsAndUploadsNothing(string backupName)
    {
        var (host, client, bucketName) = await SetupAsync();
        using var _ = host;
        using var body = new MemoryStream(Encoding.UTF8.GetBytes("evil"));

        await Assert
            .That(async () =>
                await host
                    .Services.GetRequiredService<IBackupSink>()
                    .UploadBackupAsync(backupName, body)
            )
            .Throws<ArgumentException>();

        await Assert.That(await LocalStackS3.ListAsync(client, bucketName)).IsEmpty();
    }

    [Test]
    public async Task UploadBackupAsync_ToMissingBucket_Throws()
    {
        using var host = LocalStackS3.HostFor("liftlog-test-does-not-exist");
        using var body = new MemoryStream(Encoding.UTF8.GetBytes("no-bucket"));

        await Assert
            .That(async () =>
                await host
                    .Services.GetRequiredService<IBackupSink>()
                    .UploadBackupAsync("default", body)
            )
            .Throws<AmazonS3Exception>();
    }
}

[ClassDataSource<WebApplicationFactory<Program>>(Shared = SharedType.PerClass)]
public class BackupControllerS3Tests
{
    private const string ValidApiKey = "test-backup-api-key-12345";

    private readonly WebApplicationFactory<Program> _factory;

    public BackupControllerS3Tests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Test]
    public async Task Post_WithS3SinkConfigured_StoresRequestBodyInBucket()
    {
        using var bootstrap = LocalStackS3.HostFor("bootstrap-not-used");
        var client = bootstrap.Services.GetRequiredService<IAmazonS3>();
        var bucketName = await LocalStackS3.CreateBucketAsync(client);

        using var factory = BackupTestFactory.Create(
            _factory,
            ValidApiKey,
            sink: null,
            extraConfiguration: LocalStackS3.Configuration(bucketName, keyPrefix: null)
        );

        var response = await factory
            .CreateClient()
            .SendAsync(BackupTestFactory.Request(ValidApiKey, "payload-through-s3"));

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.OK);

        var objects = await LocalStackS3.ListAsync(client, bucketName);
        await Assert.That(objects.Count).IsEqualTo(1);
        await Assert.That(objects[0].Key).StartsWith("default/");

        using var stored = await client.GetObjectAsync(bucketName, objects[0].Key);
        using var reader = new StreamReader(stored.ResponseStream);
        await Assert.That(await reader.ReadToEndAsync()).IsEqualTo("payload-through-s3");
    }
}
