using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace LiftLog.Tests.Api.Integration;

public static class TestFactoryHelper
{
    /// <summary>
    /// Creates a WebApplicationFactory with common test configuration:
    /// - Loads appsettings.json from test project directory
    /// - Sets SkipDatabaseMigrations to true
    /// - Sets TEST_MODE environment variable to "True"
    /// </summary>
    public static WebApplicationFactory<Program> CreateTestFactory(
        WebApplicationFactory<Program> factory,
        Action<IServiceCollection>? configureServices = null
    )
    {
        return factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureAppConfiguration(
                (context, config) =>
                {
                    config.AddInMemoryCollection(
                        new Dictionary<string, string?>() { ["SkipDatabaseMigrations"] = "true" }
                    );
                    // Get the path to the test project's output directory
                    var testProjectPath = Directory.GetCurrentDirectory();
                    var appsettingsPath = Path.Combine(testProjectPath, "appsettings.json");
                    config.AddJsonFile(appsettingsPath, optional: false, reloadOnChange: false);
                }
            );
            builder.ConfigureServices(services =>
            {
                // Set TEST_MODE environment variable for rate limiting bypass
                Environment.SetEnvironmentVariable("TEST_MODE", "True");

                // Allow additional service configuration
                configureServices?.Invoke(services);
            });
        });
    }
}
