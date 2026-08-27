using LiftLog.Lib.Models;
using LiftLog.Tests.Api.Integration.Providers;

namespace LiftLog.Tests.Api.Integration;

[ClassDataSource<PostgresApiFactory>(Shared = SharedType.PerClass)]
[ClassDataSource<SqliteApiFactory>(Shared = SharedType.PerClass)]
public class EventsControllerTests(ApiFactory factory)
{
    private static readonly DateTimeOffset longAgo = new(2020, 1, 1, 0, 0, 0, TimeSpan.Zero);

    private static DateTimeOffset FarFuture => DateTimeOffset.UtcNow.AddYears(1);

    // Follow secrets are client generated random strings. Tests share a database, so reusing a
    // fixed literal here would collide across tests and users.
    private static string NewSecret() => Guid.NewGuid().ToString("N");

    [Test]
    public async Task Get_ReturnsEventsForEachFollowedUser()
    {
        var client = factory.CreateClient();
        var alice = await FeedHelper.CreateUserAsync(client);
        var bob = await FeedHelper.CreateUserAsync(client);
        var aliceSecret = NewSecret();
        await FeedHelper.AddFollowSecretAsync(client, alice, aliceSecret);
        var bobSecret = NewSecret();
        await FeedHelper.AddFollowSecretAsync(client, bob, bobSecret);
        var aliceEvent = await FeedHelper.PublishEventAsync(client, alice, FarFuture, [0xA1]);
        var bobEvent = await FeedHelper.PublishEventAsync(client, bob, FarFuture, [0xB1]);

        var response = await FeedHelper.GetEventsAsync(
            client,
            new GetUserEventRequest(alice.Id, aliceSecret, longAgo),
            new GetUserEventRequest(bob.Id, bobSecret, longAgo)
        );

        await Assert.That(response.InvalidFollowSecrets).IsEmpty();
        await Assert
            .That(response.Events.Select(x => x.EventId).Order())
            .IsEquivalentTo(new[] { aliceEvent, bobEvent }.Order());
        await Assert
            .That(response.Events.Single(x => x.EventId == aliceEvent).EncryptedEventPayload)
            .IsEquivalentTo(new byte[] { 0xA1 });
    }

    [Test]
    public async Task Get_AppliesSincePerUserRatherThanGlobally()
    {
        var client = factory.CreateClient();
        var alice = await FeedHelper.CreateUserAsync(client);
        var bob = await FeedHelper.CreateUserAsync(client);
        var aliceSecret = NewSecret();
        await FeedHelper.AddFollowSecretAsync(client, alice, aliceSecret);
        var bobSecret = NewSecret();
        await FeedHelper.AddFollowSecretAsync(client, bob, bobSecret);
        await FeedHelper.PublishEventAsync(client, alice, FarFuture);
        var bobEvent = await FeedHelper.PublishEventAsync(client, bob, FarFuture);

        // Alice is already caught up; Bob is not. Only Bob's event should come back.
        var response = await FeedHelper.GetEventsAsync(
            client,
            new GetUserEventRequest(alice.Id, aliceSecret, DateTimeOffset.UtcNow.AddYears(1)),
            new GetUserEventRequest(bob.Id, bobSecret, longAgo)
        );

        await Assert.That(response.Events.Select(x => x.EventId)).IsEquivalentTo([bobEvent]);
    }

    [Test]
    public async Task Get_ExcludesExpiredEvents()
    {
        var client = factory.CreateClient();
        var alice = await FeedHelper.CreateUserAsync(client);
        var aliceSecret = NewSecret();
        await FeedHelper.AddFollowSecretAsync(client, alice, aliceSecret);

        var live = await FeedHelper.PublishEventAsync(client, alice, FarFuture);
        await FeedHelper.PublishEventAsync(client, alice, DateTimeOffset.UtcNow.AddDays(-1));

        var response = await FeedHelper.GetEventsAsync(
            client,
            new GetUserEventRequest(alice.Id, aliceSecret, longAgo)
        );

        await Assert.That(response.Events.Select(x => x.EventId)).IsEquivalentTo([live]);
    }

    [Test]
    public async Task Get_ExcludesEventsPublishedBeforeSince()
    {
        var client = factory.CreateClient();
        var alice = await FeedHelper.CreateUserAsync(client);
        var aliceSecret = NewSecret();
        await FeedHelper.AddFollowSecretAsync(client, alice, aliceSecret);
        await FeedHelper.PublishEventAsync(client, alice, FarFuture);

        var sinceBefore = await FeedHelper.GetEventsAsync(
            client,
            new GetUserEventRequest(alice.Id, aliceSecret, DateTimeOffset.UtcNow.AddHours(-1))
        );
        var sinceAfter = await FeedHelper.GetEventsAsync(
            client,
            new GetUserEventRequest(alice.Id, aliceSecret, DateTimeOffset.UtcNow.AddHours(1))
        );

        await Assert.That(sinceBefore.Events).Count().IsEqualTo(1);
        await Assert.That(sinceAfter.Events).IsEmpty();
    }

    [Test]
    public async Task Get_DoesNotDuplicateEventsWhenAFollowSecretIsStoredTwice()
    {
        var client = factory.CreateClient();
        var alice = await FeedHelper.CreateUserAsync(client);
        var secret = NewSecret();

        // Storing a follow secret does not deduplicate, so one value can back two rows. Both match
        // the lookup, which is why the fabricated filter set is UNIONed rather than UNION ALLed.
        await FeedHelper.AddFollowSecretAsync(client, alice, secret);
        await FeedHelper.AddFollowSecretAsync(client, alice, secret);
        await FeedHelper.PublishEventAsync(client, alice, FarFuture);

        var response = await FeedHelper.GetEventsAsync(
            client,
            new GetUserEventRequest(alice.Id, secret, longAgo)
        );

        await Assert.That(response.Events).Count().IsEqualTo(1);
    }

    [Test]
    public async Task Get_ReportsInvalidFollowSecretsAndReturnsNoEventsForThem()
    {
        var client = factory.CreateClient();
        var alice = await FeedHelper.CreateUserAsync(client);
        var aliceSecret = NewSecret();
        await FeedHelper.AddFollowSecretAsync(client, alice, aliceSecret);
        await FeedHelper.PublishEventAsync(client, alice, FarFuture);

        var revoked = NewSecret();
        var response = await FeedHelper.GetEventsAsync(
            client,
            new GetUserEventRequest(alice.Id, revoked, longAgo)
        );

        await Assert.That(response.Events).IsEmpty();
        await Assert.That(response.InvalidFollowSecrets).IsEquivalentTo([revoked]);
    }
}
