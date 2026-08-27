using LiftLog.Api.Db;
using Microsoft.EntityFrameworkCore;

namespace LiftLog.Api.Service;

public class CleanupExpiredDataHostedService(
    IServiceProvider services,
    ILogger<CleanupExpiredDataHostedService> logger
) : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(60);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                await CleanupAsync(stoppingToken);
                await Task.Delay(Interval, stoppingToken);
            }
        }
        catch (OperationCanceledException) { }
    }

    private async Task CleanupAsync(CancellationToken stoppingToken)
    {
        try
        {
            using var scope = services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<UserDataContext>();
            var now = DateTimeOffset.UtcNow;

            await db.UserEvents.Where(e => e.Expiry < now).ExecuteDeleteAsync(stoppingToken);
        }
        catch (Exception e) when (e is not OperationCanceledException)
        {
            // Expiring old events is housekeeping. Failing it must not take the API down.
            logger.LogError(e, "Failed to delete expired user events");
        }
    }
}
