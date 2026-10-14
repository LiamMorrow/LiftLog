using Microsoft.AspNetCore.Mvc.Testing;

namespace LiftLog.Tests.Api.Integration;

public class DbMigrate
{
    [Before(Assembly)]
    public static async Task Migrate()
    {
        await using var factory = TestFactoryHelper.CreateTestFactory(
            new WebApplicationFactory<Program>(),
            extraConfiguration: new Dictionary<string, string?>
            {
                ["SkipDatabaseMigrations"] = "false",
            }
        );

        using var client = factory.CreateClient();
    }
}
