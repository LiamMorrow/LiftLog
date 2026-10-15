using System.Net;
using System.Net.Http.Json;
using LiftLog.Lib.Models;
using LiftLog.Tests.Api.Integration.Providers;

namespace LiftLog.Tests.Api.Integration;

[ClassDataSource<PostgresApiFactory>(Shared = SharedType.PerClass)]
[ClassDataSource<SqliteApiFactory>(Shared = SharedType.PerClass)]
public class InboxControllerTests(ApiFactory factory)
{
    // RSA can only encrypt up to the key size, so a message arrives as ordered chunks.
    private static readonly byte[][] chunks =
    [
        [0x01, 0x02],
        [0x03, 0x04],
        [0x05, 0x06],
    ];

    [Test]
    public async Task PutThenGet_RoundTripsEveryChunkInOrder()
    {
        var client = factory.CreateClient();
        var alice = await FeedHelper.CreateUserAsync(client);

        (
            await client.PutAsJsonAsync("/inbox", new PutInboxMessageRequest(alice.Id, chunks))
        ).EnsureSuccessStatusCode();

        var response = await client.PostAsJsonAsync(
            "/inbox",
            new GetInboxMessagesRequest(alice.Id, alice.Password)
        );
        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadFromJsonAsync<GetInboxMessagesResponse>();

        await Assert.That(body!.InboxMessages).Count().IsEqualTo(1);
        await Assert.That(body.InboxMessages.Single().EncryptedMessage).IsEquivalentTo(chunks);
    }

    [Test]
    public async Task Get_DrainsTheInbox()
    {
        var client = factory.CreateClient();
        var alice = await FeedHelper.CreateUserAsync(client);
        (
            await client.PutAsJsonAsync("/inbox", new PutInboxMessageRequest(alice.Id, chunks))
        ).EnsureSuccessStatusCode();

        var request = new GetInboxMessagesRequest(alice.Id, alice.Password);
        var first = await (
            await client.PostAsJsonAsync("/inbox", request)
        ).Content.ReadFromJsonAsync<GetInboxMessagesResponse>();
        var second = await (
            await client.PostAsJsonAsync("/inbox", request)
        ).Content.ReadFromJsonAsync<GetInboxMessagesResponse>();

        await Assert.That(first!.InboxMessages).Count().IsEqualTo(1);
        await Assert.That(second!.InboxMessages).IsEmpty();
    }

    [Test]
    public async Task Get_OnlyReturnsTheRequestingUsersMessages()
    {
        var client = factory.CreateClient();
        var alice = await FeedHelper.CreateUserAsync(client);
        var bob = await FeedHelper.CreateUserAsync(client);
        (
            await client.PutAsJsonAsync("/inbox", new PutInboxMessageRequest(alice.Id, chunks))
        ).EnsureSuccessStatusCode();

        var response = await client.PostAsJsonAsync(
            "/inbox",
            new GetInboxMessagesRequest(bob.Id, bob.Password)
        );
        var body = await response.Content.ReadFromJsonAsync<GetInboxMessagesResponse>();

        await Assert.That(body!.InboxMessages).IsEmpty();
    }

    [Test]
    public async Task Put_ForAnUnknownUserReturnsNotFound()
    {
        var client = factory.CreateClient();

        var response = await client.PutAsJsonAsync(
            "/inbox",
            new PutInboxMessageRequest(Guid.NewGuid(), chunks)
        );

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.NotFound);
    }

    [Test]
    public async Task ManualAck_KeepsMessagesUntilTheyAreAcked()
    {
        var client = factory.CreateClient();
        var alice = await FeedHelper.CreateUserAsync(client);
        await PutAsync(client, alice.Id);
        await PutAsync(client, alice.Id);

        var first = await GetAsync(client, alice, manualAck: true);
        var second = await GetAsync(client, alice, manualAck: true);
        var acked = first.InboxMessages[0].Id;
        (
            await client.PostAsJsonAsync(
                "/inbox/ack",
                new AckInboxMessagesRequest(alice.Id, alice.Password, [acked])
            )
        ).EnsureSuccessStatusCode();
        var third = await GetAsync(client, alice, manualAck: true);

        await Assert.That(first.InboxMessages).Count().IsEqualTo(2);
        await Assert.That(second.InboxMessages).Count().IsEqualTo(2);
        await Assert
            .That(third.InboxMessages.Select(x => x.Id))
            .IsEquivalentTo([first.InboxMessages[1].Id]);
    }

    [Test]
    public async Task Ack_OnlyDeletesTheCallersOwnMessages()
    {
        var client = factory.CreateClient();
        var alice = await FeedHelper.CreateUserAsync(client);
        var bob = await FeedHelper.CreateUserAsync(client);
        await PutAsync(client, alice.Id);
        var aliceMessage = (await GetAsync(client, alice, manualAck: true)).InboxMessages.Single();

        (
            await client.PostAsJsonAsync(
                "/inbox/ack",
                new AckInboxMessagesRequest(bob.Id, bob.Password, [aliceMessage.Id])
            )
        ).EnsureSuccessStatusCode();

        var remaining = await GetAsync(client, alice, manualAck: true);
        await Assert
            .That(remaining.InboxMessages.Select(x => x.Id))
            .IsEquivalentTo([aliceMessage.Id]);
    }

    [Test]
    public async Task Ack_WithTheWrongPasswordReturnsUnauthorized()
    {
        var client = factory.CreateClient();
        var alice = await FeedHelper.CreateUserAsync(client);

        var response = await client.PostAsJsonAsync(
            "/inbox/ack",
            new AckInboxMessagesRequest(alice.Id, "not-the-password", [Guid.NewGuid()])
        );

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.Unauthorized);
    }

    [Test]
    public async Task Ack_ForAnUnknownUserReturnsNotFound()
    {
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync(
            "/inbox/ack",
            new AckInboxMessagesRequest(Guid.NewGuid(), "password", [Guid.NewGuid()])
        );

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.NotFound);
    }

    [Test]
    public async Task Ack_WithNoIdsReturnsBadRequest()
    {
        var client = factory.CreateClient();
        var alice = await FeedHelper.CreateUserAsync(client);

        var response = await client.PostAsJsonAsync(
            "/inbox/ack",
            new AckInboxMessagesRequest(alice.Id, alice.Password, [])
        );

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.BadRequest);
    }

    private static async Task PutAsync(HttpClient client, Guid toUserId) =>
        (
            await client.PutAsJsonAsync("/inbox", new PutInboxMessageRequest(toUserId, chunks))
        ).EnsureSuccessStatusCode();

    private static async Task<GetInboxMessagesResponse> GetAsync(
        HttpClient client,
        CreateUserResponse user,
        bool manualAck
    )
    {
        var response = await client.PostAsJsonAsync(
            "/inbox",
            new GetInboxMessagesRequest(user.Id, user.Password, manualAck)
        );
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<GetInboxMessagesResponse>())!;
    }

    [Test]
    public async Task Get_WithTheWrongPasswordReturnsUnauthorized()
    {
        var client = factory.CreateClient();
        var alice = await FeedHelper.CreateUserAsync(client);

        var response = await client.PostAsJsonAsync(
            "/inbox",
            new GetInboxMessagesRequest(alice.Id, "not-the-password")
        );

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.Unauthorized);
    }
}
