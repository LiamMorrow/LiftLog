using LiftLog.Api.Db;
using Microsoft.EntityFrameworkCore;

namespace LiftLog.Api.Service;

public class CleanupExpiredDataHostedService(IServiceProvider services) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using var scope = services.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<UserDataContext>();
                var now = DateTimeOffset.UtcNow;
                var expiredEvents = await db
                    .UserEvents.Where(e => e.Expiry < now)
                    .ToListAsync(cancellationToken: stoppingToken);
                db.UserEvents.RemoveRange(expiredEvents);
                await db.SaveChangesAsync(stoppingToken);
                await Task.Delay(TimeSpan.FromMinutes(60), stoppingToken);
            }
        }
        catch (TaskCanceledException) { }
    }
}
