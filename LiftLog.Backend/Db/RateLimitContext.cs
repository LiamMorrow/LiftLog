using LiftLog.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace LiftLog.Backend.Db;

public class RateLimitContext(DbContextOptions<RateLimitContext> options) : DbContext(options)
{
    public DbSet<RateLimitConsumption> RateLimitConsumptions { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<RateLimitConsumption>().HasKey(x => x.Key);
    }
}
