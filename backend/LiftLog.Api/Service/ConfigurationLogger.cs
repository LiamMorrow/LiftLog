using LiftLog.Api.Db;
using LiftLog.Api.Features;
using LiftLog.Api.Service.Backup;

namespace LiftLog.Api.Service;

public class ConfigurationLogger(
    ILogger<ConfigurationLogger> logger,
    IServiceProvider serviceProvider
) : IHostedService
{
    public Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = serviceProvider.CreateScope();
        var backupSink = scope.ServiceProvider.GetService<IBackupSink>();
        logger.LogInformation(
            "Registered backup sink: {BackupSink}",
            backupSink?.GetType().Name ?? "NONE"
        );
        var userDataContext = scope.ServiceProvider.GetRequiredService<UserDataContext>();
        logger.LogInformation("Registered database: {Database}", userDataContext.DataSource());
        var featureGate = scope.ServiceProvider.GetRequiredService<IFeatureGate>();
        foreach (var feature in Enum.GetValues<Feature>())
        {
            logger.LogInformation(
                "Feature {Feature}: {State}",
                feature,
                featureGate.IsEnabled(feature) ? "enabled" : "disabled"
            );
        }
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}
