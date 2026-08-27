using Microsoft.EntityFrameworkCore;

namespace LiftLog.Api.Db.Sqlite;

/// <inheritdoc cref="SqliteUserDataContext" />
public class SqliteRateLimitContext(DbContextOptions<SqliteRateLimitContext> options)
    : RateLimitContext(options)
{
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.StoreDateTimeOffsetsAsUtcTicks();
    }
}
