namespace LiftLog.Api.Service.Backup;

using Amazon;
using Amazon.Runtime;
using Amazon.S3;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

public static class BackupConfiguration
{
    public const string SectionName = "Backup";
    public const string SinkPath = $"{SectionName}:Sink";
    public const string SinkOptionsPath = $"{SectionName}:SinkOptions";
}

public static class RegistrationHelpers
{
    public static IHostApplicationBuilder AddBackupSink(this IHostApplicationBuilder builder)
    {
        var services = builder.Services;
        switch (builder.Configuration.GetValue<string>(BackupConfiguration.SinkPath))
        {
            case "File":
                services
                    .AddOptions<FileStorageBackupSinkOptions>()
                    .BindConfiguration(BackupConfiguration.SinkOptionsPath)
                    .ValidateDataAnnotations()
                    .ValidateOnStart();
                services.AddSingleton<IBackupSink, FileStorageBackupSink>();
                break;
            case "S3":
                services
                    .AddOptions<S3BackupSinkOptions>()
                    .BindConfiguration(BackupConfiguration.SinkOptionsPath)
                    .ValidateDataAnnotations()
                    .ValidateOnStart();
                services.AddSingleton<IAmazonS3>(sp =>
                    CreateS3Client(sp.GetRequiredService<IOptions<S3BackupSinkOptions>>().Value)
                );
                services.AddSingleton<IBackupSink, S3BackupSink>();
                break;
        }
        return builder;
    }

    private static AmazonS3Config CreateS3Config(S3BackupSinkOptions options)
    {
        var config = new AmazonS3Config { ForcePathStyle = options.ForcePathStyle };

        if (!string.IsNullOrWhiteSpace(options.ServiceUrl))
        {
            config.ServiceURL = options.ServiceUrl;
            if (!string.IsNullOrWhiteSpace(options.Region))
            {
                config.AuthenticationRegion = options.Region;
            }
        }
        else if (!string.IsNullOrWhiteSpace(options.Region))
        {
            config.RegionEndpoint = RegionEndpoint.GetBySystemName(options.Region);
        }

        return config;
    }

    private static IAmazonS3 CreateS3Client(S3BackupSinkOptions options)
    {
        var config = CreateS3Config(options);

        return string.IsNullOrWhiteSpace(options.AccessKeyId)
            ? new AmazonS3Client(config)
            : new AmazonS3Client(
                new BasicAWSCredentials(options.AccessKeyId, options.SecretAccessKey),
                config
            );
    }
}
