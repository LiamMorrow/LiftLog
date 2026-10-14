using System.Net;
using LiftLog.Api.Features;
using LiftLog.Api.Models;
using Microsoft.AspNetCore.Mvc.Testing;

namespace LiftLog.Tests.Api.Integration;

[ClassDataSource<WebApplicationFactory<Program>>(Shared = SharedType.PerClass)]
public class FeaturesControllerTests(WebApplicationFactory<Program> factory)
{
    private static async Task<FeaturesResponse> GetFeaturesAsync(
        WebApplicationFactory<Program> host
    )
    {
        var response = await host.CreateClient().GetAsync("/features");
        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.OK);
        var features = await response.Content.ReadFromJsonAsync<FeaturesResponse>();
        await Assert.That(features).IsNotNull();
        return features!;
    }

    [Test]
    public async Task Get_ByDefault_ReportsEveryFeatureEnabled()
    {
        var features = await GetFeaturesAsync(TestFactoryHelper.CreateTestFactory(factory));

        await Assert.That(features).IsEqualTo(new FeaturesResponse(true, true, true, true));
    }

    [Test]
    [Arguments(Feature.Feed)]
    [Arguments(Feature.Sharing)]
    [Arguments(Feature.AiPlanner)]
    [Arguments(Feature.Backup)]
    public async Task Get_WithOneFeatureDisabled_ReportsOnlyThatFeatureOff(Feature disabled)
    {
        var host = TestFactoryHelper.CreateTestFactory(
            factory,
            extraConfiguration: new Dictionary<string, string?>
            {
                [disabled.EnabledPath()] = "false",
            }
        );

        var features = await GetFeaturesAsync(host);

        await Assert.That(features.Feed).IsEqualTo(disabled != Feature.Feed);
        await Assert.That(features.Sharing).IsEqualTo(disabled != Feature.Sharing);
        await Assert.That(features.AiPlanner).IsEqualTo(disabled != Feature.AiPlanner);
        await Assert.That(features.Backup).IsEqualTo(disabled != Feature.Backup);
    }

    // The point of the endpoint: a client can ask what an instance offers before it has credentials
    // for any of it.
    [Test]
    public async Task Get_WithoutCredentials_IsNotChallenged()
    {
        var response = await TestFactoryHelper
            .CreateTestFactory(factory)
            .CreateClient()
            .GetAsync("/features");

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.OK);
    }
}
