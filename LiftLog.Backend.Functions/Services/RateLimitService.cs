using System.Text.Json;
using Azure;
using Azure.Data.Tables;
using System.Security.Cryptography;
using System.Runtime.Intrinsics.Arm;
using System.Text;

namespace LiftLog.Backend.Functions.Services;

public class RateLimitService
{
    private readonly TableClient tableClient;

    public RateLimitService(TableClient tableClient)
    {
        this.tableClient = tableClient;
    }

    public async Task<RateLimitResult> GetRateLimitAsync(string rateLimitKey)
    {
        var hasher = SHA256.Create();
        hasher.Initialize();
        var hash = hasher.ComputeHash(Encoding.UTF8.GetBytes(rateLimitKey));
        rateLimitKey = Convert.ToHexString(hash);

        var response = (await tableClient.GetEntityIfExistsAsync<RateLimitEntity>(rateLimitKey, rateLimitKey));
        RateLimitEntity entity;
        if (!response.HasValue)
        {
            entity = new RateLimitEntity { RowKey = rateLimitKey, PartitionKey = rateLimitKey, Requests = "[]" };
            await tableClient.AddEntityAsync(entity);
        }
        else
        {
            entity = response.Value;
        }

        var requests = JsonSerializer.Deserialize<List<DateTimeOffset>>(entity.Requests) ?? new List<DateTimeOffset>();
        var requestsInLastDay = requests.Where(r => r > DateTimeOffset.UtcNow.AddDays(-1)).ToList();

        if (requestsInLastDay.Count < 10)
        {
            requestsInLastDay.Add(DateTimeOffset.UtcNow);
            entity.Requests = JsonSerializer.Serialize(requestsInLastDay);
            await tableClient.UpdateEntityAsync(entity, ETag.All);
        }

        return new RateLimitResult(requestsInLastDay.Count >= 10, requestsInLastDay.Min() + TimeSpan.FromDays(1));
    }
}

public class RateLimitEntity : ITableEntity
{
    public string PartitionKey { get; set; } = null!;
    public string RowKey { get; set; } = null!;
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }

    public string Requests { get; set; } = null!;
}

public record RateLimitResult(bool IsRateLimited, DateTimeOffset RetryAfter);
