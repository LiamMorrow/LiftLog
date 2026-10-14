using LiftLog.Api.Db.Postgres;
using LiftLog.Api.Db.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Migrations;

namespace LiftLog.Api.Db;

public enum DatabaseProvider
{
    Postgres,
    Sqlite,
}

public static class DatabaseConfiguration
{
    public const string SectionName = "Database";
    public const string ProviderPath = $"{SectionName}:Provider";
    public const string ConnectionStringPath = $"{SectionName}:ConnectionString";

    public static DatabaseProvider GetDatabaseProvider(this IConfiguration configuration)
    {
        var value = configuration.GetValue<string>(ProviderPath);
        if (string.IsNullOrWhiteSpace(value))
        {
            return DatabaseProvider.Postgres;
        }

        return Enum.TryParse<DatabaseProvider>(value, ignoreCase: true, out var provider)
            ? provider
            : throw new InvalidOperationException(
                $"'{value}' is not a supported value for '{ProviderPath}'. Supported values are: "
                    + string.Join(", ", Enum.GetNames<DatabaseProvider>())
            );
    }

    public static string GetDatabaseConnectionString(this IConfiguration configuration) =>
        configuration.GetValue<string>(ConnectionStringPath)
        ?? throw new InvalidOperationException(
            $"'{ConnectionStringPath}' is not configured. Both database contexts now share this one "
                + "connection string; the per-context 'ConnectionStrings:UserDataContext' and "
                + "'ConnectionStrings:RateLimitContext' entries are no longer read."
        );

    public static DbContextOptionsBuilder UseConfiguredProvider(
        this DbContextOptionsBuilder options,
        DatabaseProvider provider,
        string connectionString
    )
    {
        switch (provider)
        {
            case DatabaseProvider.Postgres:
                options
                    .UseNpgsql(connectionString)
                    .ReplaceService<IHistoryRepository, CamelCaseHistoryContext>();
                break;
            case DatabaseProvider.Sqlite:
                options.UseSqlite(connectionString).AddInterceptors(new SqlitePragmaInterceptor());
                break;
        }

        return options.UseSnakeCaseNamingConvention();
    }

    /// <summary>
    /// Registers the pair of contexts for the configured provider. Both providers use derived
    /// context types (so their migration sets stay separate), aliased back to the abstract base so
    /// everything downstream keeps injecting <see cref="UserDataContext" /> and
    /// <see cref="RateLimitContext" />.
    /// </summary>
    public static IServiceCollection AddLiftLogDbContexts(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        var provider = configuration.GetDatabaseProvider();
        var connectionString = configuration.GetDatabaseConnectionString();

        switch (provider)
        {
            case DatabaseProvider.Postgres:
                services.AddDbContext<PostgresUserDataContext>(options =>
                    options.UseConfiguredProvider(provider, connectionString)
                );
                services.AddDbContext<PostgresRateLimitContext>(options =>
                    options.UseConfiguredProvider(provider, connectionString)
                );
                services.AddScoped<UserDataContext>(s =>
                    s.GetRequiredService<PostgresUserDataContext>()
                );
                services.AddScoped<RateLimitContext>(s =>
                    s.GetRequiredService<PostgresRateLimitContext>()
                );
                break;
            case DatabaseProvider.Sqlite:
                services.AddDbContext<SqliteUserDataContext>(options =>
                    options.UseConfiguredProvider(provider, connectionString)
                );
                services.AddDbContext<SqliteRateLimitContext>(options =>
                    options.UseConfiguredProvider(provider, connectionString)
                );
                services.AddScoped<UserDataContext>(s =>
                    s.GetRequiredService<SqliteUserDataContext>()
                );
                services.AddScoped<RateLimitContext>(s =>
                    s.GetRequiredService<SqliteRateLimitContext>()
                );
                break;
        }

        return services;
    }
}
