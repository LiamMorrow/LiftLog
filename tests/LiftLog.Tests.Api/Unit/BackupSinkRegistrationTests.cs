using Amazon.S3;
using LiftLog.Api.Service.Backup;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

namespace LiftLog.Tests.Api.Unit;

public class BackupSinkRegistrationTests
{
    private static IHost HostFor(Dictionary<string, string?> settings)
    {
        var builder = Host.CreateEmptyApplicationBuilder(null);
        builder.Configuration.AddInMemoryCollection(settings);
        builder.AddBackupSink();

        return builder.Build();
    }

    [Test]
    [Arguments(null)]
    [Arguments("")]
    [Arguments("Unknown")]
    [Arguments("file")]
    [Arguments("s3")]
    public async Task AddBackupSink_WithUnrecognisedSinkType_RegistersNoSink(string? sinkType)
    {
        using var host = HostFor(new() { ["Backup:Sink"] = sinkType });

        await Assert.That(host.Services.GetService<IBackupSink>()).IsNull();
    }

    [Test]
    public async Task AddBackupSink_File_ResolvesFileSink()
    {
        var root = Directory.CreateTempSubdirectory();
        try
        {
            using var host = HostFor(
                new()
                {
                    ["Backup:Sink"] = "File",
                    ["Backup:SinkOptions:BackupDirectory"] = root.FullName,
                }
            );

            await Assert
                .That(host.Services.GetRequiredService<IBackupSink>())
                .IsTypeOf<FileStorageBackupSink>();
        }
        finally
        {
            root.Delete(recursive: true);
        }
    }

    [Test]
    [Arguments(null)]
    [Arguments("")]
    [Arguments("   ")]
    public async Task AddBackupSink_File_WithBlankDirectory_FailsValidation(string? directory)
    {
        using var host = HostFor(
            new() { ["Backup:Sink"] = "File", ["Backup:SinkOptions:BackupDirectory"] = directory }
        );

        await Assert
            .That(() => host.Services.GetRequiredService<IBackupSink>())
            .Throws<OptionsValidationException>();
    }

    [Test]
    public async Task AddBackupSink_S3_ResolvesS3Sink()
    {
        using var host = HostFor(
            new()
            {
                ["Backup:Sink"] = "S3",
                ["Backup:SinkOptions:BucketName"] = "liftlog-backups",
                ["Backup:SinkOptions:Region"] = "ap-southeast-2",
            }
        );

        await Assert.That(host.Services.GetRequiredService<IBackupSink>()).IsTypeOf<S3BackupSink>();
    }

    [Test]
    public async Task AddBackupSink_S3_WithNeitherRegionNorServiceUrl_FailsValidation()
    {
        using var host = HostFor(
            new() { ["Backup:Sink"] = "S3", ["Backup:SinkOptions:BucketName"] = "liftlog-backups" }
        );

        await Assert
            .That(() => host.Services.GetRequiredService<IBackupSink>())
            .Throws<OptionsValidationException>();
    }

    [Test]
    public async Task AddBackupSink_S3_WithServiceUrlButNoRegion_IsValid()
    {
        using var host = HostFor(
            new()
            {
                ["Backup:Sink"] = "S3",
                ["Backup:SinkOptions:BucketName"] = "liftlog-backups",
                ["Backup:SinkOptions:ServiceUrl"] = "http://localhost:4566",
            }
        );

        await Assert.That(host.Services.GetRequiredService<IBackupSink>()).IsTypeOf<S3BackupSink>();
    }

    [Test]
    [Arguments(null)]
    [Arguments("")]
    [Arguments("   ")]
    public async Task AddBackupSink_S3_WithBlankBucketName_FailsValidation(string? bucketName)
    {
        using var host = HostFor(
            new()
            {
                ["Backup:Sink"] = "S3",
                ["Backup:SinkOptions:BucketName"] = bucketName,
                ["Backup:SinkOptions:Region"] = "ap-southeast-2",
            }
        );

        await Assert
            .That(() => host.Services.GetRequiredService<IBackupSink>())
            .Throws<OptionsValidationException>();
    }

    [Test]
    public async Task AddBackupSink_S3_WithServiceUrl_UsesItAsEndpoint()
    {
        using var host = HostFor(
            new()
            {
                ["Backup:Sink"] = "S3",
                ["Backup:SinkOptions:BucketName"] = "liftlog-backups",
                ["Backup:SinkOptions:ServiceUrl"] = "http://localhost:4566",
                ["Backup:SinkOptions:Region"] = "us-east-1",
                ["Backup:SinkOptions:ForcePathStyle"] = "true",
            }
        );

        var config = (AmazonS3Config)host.Services.GetRequiredService<IAmazonS3>().Config;

        await Assert.That(config.ServiceURL).StartsWith("http://localhost:4566");
        await Assert.That(config.AuthenticationRegion).IsEqualTo("us-east-1");
        await Assert.That(config.ForcePathStyle).IsTrue();
    }

    [Test]
    public async Task AddBackupSink_S3_WithRegionOnly_ResolvesRegionEndpoint()
    {
        using var host = HostFor(
            new()
            {
                ["Backup:Sink"] = "S3",
                ["Backup:SinkOptions:BucketName"] = "liftlog-backups",
                ["Backup:SinkOptions:Region"] = "ap-southeast-2",
            }
        );

        var config = (AmazonS3Config)host.Services.GetRequiredService<IAmazonS3>().Config;

        await Assert.That(config.RegionEndpoint?.SystemName).IsEqualTo("ap-southeast-2");
        await Assert.That(config.ServiceURL).IsNullOrEmpty();
    }

    [Test]
    [Arguments("access-key-id", null)]
    [Arguments(null, "secret-access-key")]
    [Arguments("access-key-id", "")]
    [Arguments("", "secret-access-key")]
    public async Task AddBackupSink_S3_WithHalfConfiguredCredentials_Throws(
        string? accessKeyId,
        string? secretAccessKey
    )
    {
        using var host = HostFor(
            new()
            {
                ["Backup:Sink"] = "S3",
                ["Backup:SinkOptions:BucketName"] = "liftlog-backups",
                ["Backup:SinkOptions:Region"] = "ap-southeast-2",
                ["Backup:SinkOptions:AccessKeyId"] = accessKeyId,
                ["Backup:SinkOptions:SecretAccessKey"] = secretAccessKey,
            }
        );

        await Assert
            .That(() => host.Services.GetRequiredService<IAmazonS3>())
            .Throws<OptionsValidationException>();
    }

    [Test]
    public async Task AddBackupSink_S3_WithBothCredentials_ResolvesClient()
    {
        using var host = HostFor(
            new()
            {
                ["Backup:Sink"] = "S3",
                ["Backup:SinkOptions:BucketName"] = "liftlog-backups",
                ["Backup:SinkOptions:Region"] = "ap-southeast-2",
                ["Backup:SinkOptions:AccessKeyId"] = "access-key-id",
                ["Backup:SinkOptions:SecretAccessKey"] = "secret-access-key",
            }
        );

        await Assert.That(() => host.Services.GetRequiredService<IAmazonS3>()).ThrowsNothing();
    }
}
