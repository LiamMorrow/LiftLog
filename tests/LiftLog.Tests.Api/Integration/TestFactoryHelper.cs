using LiftLog.Api.Db;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace LiftLog.Tests.Api.Integration;

public static class TestFactoryHelper
{
    private const string EnvironmentName = "Test";

    private static readonly string SettingsPath = Path.Combine(
        Directory.GetCurrentDirectory(),
        "appsettings.json"
    );

    private static readonly string DevelopmentSettingsPath = Path.Combine(
        Directory.GetCurrentDirectory(),
        "appsettings.Development.json"
    );

    private static readonly IConfiguration Settings = new ConfigurationBuilder()
        .AddJsonFile(SettingsPath, optional: false, reloadOnChange: false)
        .AddJsonFile(DevelopmentSettingsPath, optional: true, reloadOnChange: false)
        .AddEnvironmentVariables()
        .Build();

    static TestFactoryHelper()
    {
        // Read by RateLimitService to bypass rate limiting. Set once here rather than per host so
        // it cannot race a request from a host that is already serving.
        Environment.SetEnvironmentVariable("TEST_MODE", "True");
    }

    /// <summary>
    /// Creates a WebApplicationFactory that runs against the test project's appsettings, skips
    /// migrations, and bypasses rate limiting.
    /// </summary>
    public static WebApplicationFactory<Program> CreateTestFactory(
        WebApplicationFactory<Program> factory,
        Action<IServiceCollection>? configureServices = null,
        IReadOnlyDictionary<string, string?>? extraConfiguration = null
    )
    {
        // Program.cs picks the database context types from builder.Configuration while registering
        // services, before any ConfigureAppConfiguration source is added, so the database has to be
        // decided up front. Default to whatever the test appsettings select unless a caller says
        // otherwise.
        var settings = new Dictionary<string, string?>
        {
            [DatabaseConfiguration.ProviderPath] = Settings[DatabaseConfiguration.ProviderPath],
            [DatabaseConfiguration.ConnectionStringPath] = Settings[
                DatabaseConfiguration.ConnectionStringPath
            ],
            ["SkipDatabaseMigrations"] = "true",
        };

        foreach (var (key, value) in extraConfiguration ?? new Dictionary<string, string?>())
        {
            settings[key] = value;
        }

        return factory.WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment(EnvironmentName);

            // Host settings, not app configuration: these are the values Program.cs needs while it
            // is still registering services.
            foreach (var (key, value) in settings)
            {
                builder.UseSetting(key, value);
            }

            builder.ConfigureAppConfiguration(
                (context, config) =>
                {
                    config.AddJsonFile(SettingsPath, optional: false, reloadOnChange: false);
                    config.AddJsonFile(
                        DevelopmentSettingsPath,
                        optional: true,
                        reloadOnChange: false
                    );
                    config.AddEnvironmentVariables();

                    // Applied last so the settings above cannot drift from what service
                    // registration already decided.
                    config.AddInMemoryCollection(settings);
                }
            );

            builder.ConfigureServices(services => configureServices?.Invoke(services));
        });
    }
}
