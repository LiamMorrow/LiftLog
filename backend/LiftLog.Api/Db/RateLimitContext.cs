using LiftLog.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LiftLog.Api.Db;

public abstract class RateLimitContext : DbContext
{
    protected RateLimitContext(DbContextOptions options)
        : base(options) { }

    public DbSet<RateLimitConsumption> RateLimitConsumptions { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<RateLimitConsumption>().HasKey(x => x.Key);
    }
}
