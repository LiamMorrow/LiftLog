using Microsoft.AspNetCore.Mvc.Testing;

namespace LiftLog.Tests.Api.Integration.Providers;

public abstract class ApiFactory : IAsyncDisposable
{
    private WebApplicationFactory<Program>? factory;

    public abstract string ProviderName { get; }

    protected abstract Dictionary<string, string?> DatabaseSettings { get; }

    /// <summary>
    /// Postgres migrations are applied once per assembly by <see cref="DbMigrate" />. SQLite starts
    /// from an empty file per factory, so it migrates on boot instead.
    /// </summary>
    protected virtual bool SkipDatabaseMigrations => true;

    public HttpClient CreateClient() => GetFactory().CreateClient();

    public WebApplicationFactory<Program> GetFactory() =>
        factory ??= TestFactoryHelper.CreateTestFactory(
            new WebApplicationFactory<Program>(),
            extraConfiguration: new Dictionary<string, string?>(DatabaseSettings)
            {
                ["SkipDatabaseMigrations"] = SkipDatabaseMigrations ? "true" : "false",
            }
        );

    public virtual async ValueTask DisposeAsync()
    {
        if (factory is not null)
        {
            await factory.DisposeAsync();
            factory = null;
        }

        GC.SuppressFinalize(this);
    }

    public override string ToString() => ProviderName;
}

public sealed class PostgresApiFactory : ApiFactory
{
    public override string ProviderName => "Postgres";

    // The connection string stays in appsettings.json so it can point at CI or a local compose.
    protected override Dictionary<string, string?> DatabaseSettings =>
        new() { ["Database:Provider"] = "Postgres" };
}

public sealed class SqliteApiFactory : ApiFactory
{
    private readonly string databasePath = Path.Combine(
        Path.GetTempPath(),
        $"liftlog-test-{Guid.NewGuid():N}.db"
    );

    public override string ProviderName => "Sqlite";

    protected override bool SkipDatabaseMigrations => false;

    protected override Dictionary<string, string?> DatabaseSettings =>
        new()
        {
            ["Database:Provider"] = "Sqlite",
            ["Database:ConnectionString"] = $"Data Source={databasePath};Foreign Keys=True",
        };

    public override async ValueTask DisposeAsync()
    {
        await base.DisposeAsync();

        // WAL leaves sidecar files next to the database.
        foreach (var suffix in new[] { "", "-wal", "-shm" })
        {
            try
            {
                File.Delete(databasePath + suffix);
            }
            catch (IOException) { }
        }
    }
}
