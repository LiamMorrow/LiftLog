namespace LiftLog.Api.Models;

public class RateLimitConsumption
{
    public string Key { get; set; } = null!;

    public List<DateTimeOffset> Requests { get; set; } = null!;
}
