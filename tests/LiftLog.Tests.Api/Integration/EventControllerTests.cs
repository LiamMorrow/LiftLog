using System.Net;
using System.Net.Http.Json;
using LiftLog.Lib.Models;
using LiftLog.Tests.Api.Integration.Providers;

namespace LiftLog.Tests.Api.Integration;

[ClassDataSource<PostgresApiFactory>(Shared = SharedType.PerClass)]
[ClassDataSource<SqliteApiFactory>(Shared = SharedType.PerClass)]
public class EventControllerTests(ApiFactory factory)
{
    private static readonly DateTimeOffset longAgo = new(2020, 1, 1, 0, 0, 0, TimeSpan.Zero);
    private static readonly byte[] encryptionIV = Enumerable.Repeat((byte)0x04, 16).ToArray();

    private static DateTimeOffset FarFuture => DateTimeOffset.UtcNow.AddYears(1);

    [Test]
    public async Task Put_StoresAnEventThatCanBeReadBack()
    {
        var client = factory.CreateClient();
        var alice = await FeedHelper.CreateUserAsync(client);
        var secret = Guid.NewGuid().ToString("N");
        await FeedHelper.AddFollowSecretAsync(client, alice, secret);

        var eventId = await FeedHelper.PublishEventAsync(client, alice, FarFuture, [0x0A, 0x0B]);

        var response = await FeedHelper.GetEventsAsync(
            client,
            new GetUserEventRequest(alice.Id, secret, longAgo)
        );
        var stored = response.Events.Single();
        await Assert.That(stored.EventId).IsEqualTo(eventId);
        await Assert.That(stored.UserId).IsEqualTo(alice.Id);
        await Assert.That(stored.EncryptedEventPayload).IsEquivalentTo(new byte[] { 0x0A, 0x0B });
        await Assert.That(stored.EncryptedEventIV).IsEquivalentTo(encryptionIV);
    }

    [Test]
    public async Task Put_ReusingAnEventIdReplacesThePreviousPayload()
    {
        var client = factory.CreateClient();
        var alice = await FeedHelper.CreateUserAsync(client);
        var secret = Guid.NewGuid().ToString("N");
        await FeedHelper.AddFollowSecretAsync(client, alice, secret);

        var eventId = Guid.NewGuid();
        await FeedHelper.PublishEventAsync(client, alice, FarFuture, [0x01], eventId);
        await FeedHelper.PublishEventAsync(client, alice, FarFuture, [0x02], eventId);

        var response = await FeedHelper.GetEventsAsync(
            client,
            new GetUserEventRequest(alice.Id, secret, longAgo)
        );
        await Assert.That(response.Events).Count().IsEqualTo(1);
        await Assert
            .That(response.Events.Single().EncryptedEventPayload)
            .IsEquivalentTo(new byte[] { 0x02 });
    }

    [Test]
    public async Task Put_ForAnUnknownUserReturnsNotFound()
    {
        var client = factory.CreateClient();

        var response = await client.PutAsJsonAsync(
            "/event",
            new PutUserEventRequest(
                Guid.NewGuid(),
                "any-password",
                Guid.NewGuid(),
                [0x01],
                encryptionIV,
                FarFuture
            )
        );

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.NotFound);
    }

    [Test]
    public async Task Put_WithTheWrongPasswordReturnsUnauthorized()
    {
        var client = factory.CreateClient();
        var alice = await FeedHelper.CreateUserAsync(client);

        var response = await client.PutAsJsonAsync(
            "/event",
            new PutUserEventRequest(
                alice.Id,
                "not-the-password",
                Guid.NewGuid(),
                [0x01],
                encryptionIV,
                FarFuture
            )
        );

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.Unauthorized);
    }

    [Test]
    public async Task Put_WithAnEmptyPayloadReturnsBadRequest()
    {
        var client = factory.CreateClient();
        var alice = await FeedHelper.CreateUserAsync(client);

        var response = await client.PutAsJsonAsync(
            "/event",
            new PutUserEventRequest(
                alice.Id,
                alice.Password,
                Guid.NewGuid(),
                [],
                encryptionIV,
                FarFuture
            )
        );

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.BadRequest);
    }
}
