using Microsoft.AspNetCore.Mvc.Testing;

namespace LiftLog.Tests.Api.Integration;

public class DbMigrate
{
    [Before(Assembly)]
    public static async Task Migrate()
    {
        using var factory = new WebApplicationFactory<Program>();
        using var client = factory
            .WithWebHostBuilder(builder =>
            {
                builder.UseEnvironment("Test");
                builder.ConfigureAppConfiguration(
                    (context, config) =>
                    {
                        // Get the path to the test project's output directory
                        var testProjectPath = Directory.GetCurrentDirectory();
                        var appsettingsPath = Path.Combine(testProjectPath, "appsettings.json");
                        config.AddJsonFile(appsettingsPath, optional: false, reloadOnChange: false);
                    }
                );
            })
            .CreateClient();
    }
}
