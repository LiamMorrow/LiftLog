using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.EntityFrameworkCore.Migrations;

namespace LiftLog.Api.Db.Postgres;

/// <summary>
/// Lets `dotnet ef migrations add ... --context Postgres*Context` generate against Postgres without
/// depending on whatever provider the local appsettings happen to select. The connection string is
/// never opened - EF only needs the provider to build the model.
/// </summary>
public class PostgresUserDataContextFactory : IDesignTimeDbContextFactory<PostgresUserDataContext>
{
    public PostgresUserDataContext CreateDbContext(string[] args) =>
        new(
            new DbContextOptionsBuilder<PostgresUserDataContext>()
                .UseNpgsql("Host=design-time")
                .ReplaceService<IHistoryRepository, CamelCaseHistoryContext>()
                .UseSnakeCaseNamingConvention()
                .Options
        );
}

/// <inheritdoc cref="PostgresUserDataContextFactory" />
public class PostgresRateLimitContextFactory : IDesignTimeDbContextFactory<PostgresRateLimitContext>
{
    public PostgresRateLimitContext CreateDbContext(string[] args) =>
        new(
            new DbContextOptionsBuilder<PostgresRateLimitContext>()
                .UseNpgsql("Host=design-time")
                .ReplaceService<IHistoryRepository, CamelCaseHistoryContext>()
                .UseSnakeCaseNamingConvention()
                .Options
        );
}
