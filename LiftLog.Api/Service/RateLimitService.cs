using System.Security.Cryptography;
using System.Text;
using LiftLog.Api.Db;
using LiftLog.Lib.Models;

namespace LiftLog.Api.Service;

public class RateLimitService(RateLimitContext rateLimitContext)
{
    public async Task<RateLimitResult> GetRateLimitAsync(AppStore appStore, string rateLimitKey)
    {
        if (System.Environment.GetEnvironmentVariable("TEST_MODE") == "True")
        {
            return new RateLimitResult(false, DateTimeOffset.UtcNow);
        }
        var hasher = SHA256.Create();
        hasher.Initialize();
        var hash = hasher.ComputeHash(Encoding.UTF8.GetBytes(rateLimitKey));
        rateLimitKey = Convert.ToHexString(hash);

        var rateLimitConsumption = (
            await rateLimitContext.RateLimitConsumptions.FindAsync(rateLimitKey)
        );
        if (rateLimitConsumption is null)
        {
            rateLimitConsumption = new Models.RateLimitConsumption
            {
                Key = rateLimitKey,
                Requests = []
            };
            rateLimitContext.RateLimitConsumptions.Add(rateLimitConsumption);
        }

        var requestsInLastDay = rateLimitConsumption
            .Requests.Where(r => r > DateTimeOffset.UtcNow.AddDays(-1))
            .ToList();

        var limit = appStore switch
        {
            AppStore.Web => 100,
            _ => 20
        };

        if (requestsInLastDay.Count < limit)
        {
            requestsInLastDay.Add(DateTimeOffset.UtcNow);
            rateLimitConsumption.Requests = requestsInLastDay;
            await rateLimitContext.SaveChangesAsync();
        }

        return new RateLimitResult(
            requestsInLastDay.Count >= limit,
            requestsInLastDay.Min() + TimeSpan.FromDays(1)
        );
    }
}

public record RateLimitResult(bool IsRateLimited, DateTimeOffset RetryAfter);
