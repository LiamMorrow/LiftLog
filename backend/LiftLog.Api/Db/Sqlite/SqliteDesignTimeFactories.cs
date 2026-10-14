using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace LiftLog.Api.Db.Sqlite;

/// <summary>
/// Lets `dotnet ef migrations add ... --context Sqlite*Context` generate against SQLite without
/// depending on whatever provider the local appsettings happen to select. The connection string is
/// never opened - EF only needs the provider to build the model.
/// </summary>
public class SqliteUserDataContextFactory : IDesignTimeDbContextFactory<SqliteUserDataContext>
{
    public SqliteUserDataContext CreateDbContext(string[] args) =>
        new(
            new DbContextOptionsBuilder<SqliteUserDataContext>()
                .UseSqlite("Data Source=design-time.db")
                .UseSnakeCaseNamingConvention()
                .Options
        );
}

/// <inheritdoc cref="SqliteUserDataContextFactory" />
public class SqliteRateLimitContextFactory : IDesignTimeDbContextFactory<SqliteRateLimitContext>
{
    public SqliteRateLimitContext CreateDbContext(string[] args) =>
        new(
            new DbContextOptionsBuilder<SqliteRateLimitContext>()
                .UseSqlite("Data Source=design-time.db")
                .UseSnakeCaseNamingConvention()
                .Options
        );
}
