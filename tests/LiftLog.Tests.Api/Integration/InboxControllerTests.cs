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
    private static readonly byte[][] chunks = [[0x01, 0x02], [0x03, 0x04], [0x05, 0x06]];

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
        var first = await (await client.PostAsJsonAsync("/inbox", request)).Content.ReadFromJsonAsync<GetInboxMessagesResponse>();
        var second = await (await client.PostAsJsonAsync("/inbox", request)).Content.ReadFromJsonAsync<GetInboxMessagesResponse>();

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
