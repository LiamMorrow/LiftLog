using System.Net;
using System.Net.Http.Json;
using LiftLog.Lib.Models;
using LiftLog.Tests.Api.Integration.Providers;

namespace LiftLog.Tests.Api.Integration;

[ClassDataSource<PostgresApiFactory>(Shared = SharedType.PerClass)]
[ClassDataSource<SqliteApiFactory>(Shared = SharedType.PerClass)]
public class UsersControllerTests(ApiFactory factory)
{
    [Test]
    public async Task Post_ReturnsEveryRequestedUserKeyedById()
    {
        var client = factory.CreateClient();
        var alice = await FeedHelper.CreateUserAsync(client);
        var bob = await FeedHelper.CreateUserAsync(client);

        var response = await client.PostAsJsonAsync(
            "/users",
            new GetUsersRequest([alice.Id, bob.Id])
        );
        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadFromJsonAsync<GetUsersResponse>();

        await Assert.That(body!.Users.Keys.Order()).IsEquivalentTo(new[] { alice.Id, bob.Id }.Order());
        await Assert.That(body.Users[alice.Id].Lookup).IsEqualTo(alice.Lookup);
    }

    [Test]
    public async Task Post_OmitsUnknownIds()
    {
        var client = factory.CreateClient();
        var alice = await FeedHelper.CreateUserAsync(client);

        var response = await client.PostAsJsonAsync(
            "/users",
            new GetUsersRequest([alice.Id, Guid.NewGuid()])
        );
        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadFromJsonAsync<GetUsersResponse>();

        await Assert.That(body!.Users.Keys).IsEquivalentTo([alice.Id]);
    }

    [Test]
    public async Task Post_WithNoIdsReturnsBadRequest()
    {
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/users", new GetUsersRequest([]));

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.BadRequest);
    }
}
