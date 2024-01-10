using System.ComponentModel.DataAnnotations.Schema;

namespace LiftLog.Backend.Models;

public class RateLimitConsumption
{
    public string Key { get; set; } = null!;

    public List<DateTimeOffset> Requests { get; set; } = null!;
}
