using System.Net;
using System.Net.Http.Json;
using LiftLog.Lib.Models;
using LiftLog.Tests.Api.Integration.Providers;

namespace LiftLog.Tests.Api.Integration;

[ClassDataSource<PostgresApiFactory>(Shared = SharedType.PerClass)]
[ClassDataSource<SqliteApiFactory>(Shared = SharedType.PerClass)]
public class FollowSecretControllerTests(ApiFactory factory)
{
    private static readonly DateTimeOffset longAgo = new(2020, 1, 1, 0, 0, 0, TimeSpan.Zero);

    private static DateTimeOffset FarFuture => DateTimeOffset.UtcNow.AddYears(1);

    [Test]
    public async Task Delete_RevokesAccessToTheFeed()
    {
        var client = factory.CreateClient();
        var alice = await FeedHelper.CreateUserAsync(client);
        var secret = Guid.NewGuid().ToString("N");
        await FeedHelper.AddFollowSecretAsync(client, alice, secret);
        await FeedHelper.PublishEventAsync(client, alice, FarFuture);

        var whileFollowing = await FeedHelper.GetEventsAsync(
            client,
            new GetUserEventRequest(alice.Id, secret, longAgo)
        );

        (
            await client.PostAsJsonAsync(
                "/follow-secret/delete",
                new DeleteUserFollowSecretRequest(alice.Id, alice.Password, secret)
            )
        ).EnsureSuccessStatusCode();

        var afterRevoking = await FeedHelper.GetEventsAsync(
            client,
            new GetUserEventRequest(alice.Id, secret, longAgo)
        );

        await Assert.That(whileFollowing.Events).Count().IsEqualTo(1);
        await Assert.That(afterRevoking.Events).IsEmpty();
        await Assert.That(afterRevoking.InvalidFollowSecrets).IsEquivalentTo([secret]);
    }

    [Test]
    public async Task Delete_OnlyRevokesTheNamedSecret()
    {
        var client = factory.CreateClient();
        var alice = await FeedHelper.CreateUserAsync(client);
        var kept = Guid.NewGuid().ToString("N");
        var revoked = Guid.NewGuid().ToString("N");
        await FeedHelper.AddFollowSecretAsync(client, alice, kept);
        await FeedHelper.AddFollowSecretAsync(client, alice, revoked);
        await FeedHelper.PublishEventAsync(client, alice, FarFuture);

        (
            await client.PostAsJsonAsync(
                "/follow-secret/delete",
                new DeleteUserFollowSecretRequest(alice.Id, alice.Password, revoked)
            )
        ).EnsureSuccessStatusCode();

        var response = await FeedHelper.GetEventsAsync(
            client,
            new GetUserEventRequest(alice.Id, kept, longAgo)
        );

        await Assert.That(response.Events).Count().IsEqualTo(1);
        await Assert.That(response.InvalidFollowSecrets).IsEmpty();
    }

    [Test]
    public async Task Put_ForAnUnknownUserReturnsNotFound()
    {
        var client = factory.CreateClient();

        var response = await client.PutAsJsonAsync(
            "/follow-secret",
            new PutUserFollowSecretRequest(Guid.NewGuid(), "any-password", "a-secret")
        );

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.NotFound);
    }

    [Test]
    public async Task Put_WithTheWrongPasswordReturnsUnauthorized()
    {
        var client = factory.CreateClient();
        var alice = await FeedHelper.CreateUserAsync(client);

        var response = await client.PutAsJsonAsync(
            "/follow-secret",
            new PutUserFollowSecretRequest(alice.Id, "not-the-password", "a-secret")
        );

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.Unauthorized);
    }

    [Test]
    public async Task Delete_WithTheWrongPasswordReturnsUnauthorized()
    {
        var client = factory.CreateClient();
        var alice = await FeedHelper.CreateUserAsync(client);
        var secret = Guid.NewGuid().ToString("N");
        await FeedHelper.AddFollowSecretAsync(client, alice, secret);

        var response = await client.PostAsJsonAsync(
            "/follow-secret/delete",
            new DeleteUserFollowSecretRequest(alice.Id, "not-the-password", secret)
        );

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.Unauthorized);
    }
}
