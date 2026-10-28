using System.Collections.Concurrent;
using System.Net;
using System.Net.Http.Json;
using LiftLog.Api.Features;
using LiftLog.Api.Models;
using LiftLog.Lib.Models;
using LiftLog.Tests.Api.Integration.Providers;
using Microsoft.AspNetCore.Http.Connections;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.SignalR.Client;

namespace LiftLog.Tests.Api.Integration;

[ClassDataSource<PostgresApiFactory>(Shared = SharedType.PerClass)]
[ClassDataSource<SqliteApiFactory>(Shared = SharedType.PerClass)]
public class FeedHubTests(ApiFactory factory)
{
    private static readonly byte[] payload = [0x01, 0x02, 0x03];
    private static readonly byte[] iv = Enumerable.Repeat((byte)0x04, 12).ToArray();

    private sealed class Received
    {
        public ConcurrentQueue<LiveFrame> Frames { get; } = new();
        public ConcurrentQueue<(Guid UserId, Guid EventId)> Ended { get; } = new();
        public int Nudges;
    }

    private async Task<(HubConnection Connection, Received Received)> ConnectAsync()
    {
        var server = factory.GetFactory().Server;
        var connection = new HubConnectionBuilder()
            .WithUrl(
                $"{server.BaseAddress}feed-hub",
                options =>
                {
                    options.Transports = HttpTransportType.WebSockets;
                    options.SkipNegotiation = true;
                    options.WebSocketFactory = async (context, cancellationToken) =>
                        await server
                            .CreateWebSocketClient()
                            .ConnectAsync(context.Uri, cancellationToken);
                }
            )
            .Build();
        var received = new Received();
        connection.On<LiveFrame>("LiveFrame", received.Frames.Enqueue);
        connection.On<Guid, Guid>("LiveEnded", (userId, eventId) => received.Ended.Enqueue((userId, eventId)));
        connection.On("InboxNudge", () => Interlocked.Increment(ref received.Nudges));
        await connection.StartAsync();
        return (connection, received);
    }

    private static async Task WaitForAsync(Func<bool> predicate, int timeoutMs = 5000)
    {
        var deadline = DateTime.UtcNow.AddMilliseconds(timeoutMs);
        while (!predicate() && DateTime.UtcNow < deadline)
        {
            await Task.Delay(25);
        }
    }

    private async Task<(CreateUserResponse User, string Secret)> CreateTrainerAsync(HttpClient client)
    {
        var user = await FeedHelper.CreateUserAsync(client);
        var secret = Guid.NewGuid().ToString("N");
        await FeedHelper.AddFollowSecretAsync(client, user, secret);
        return (user, secret);
    }

    [Test]
    public async Task Authenticate_WithTheWrongPassword_IsRejected()
    {
        var client = factory.CreateClient();
        var alice = await FeedHelper.CreateUserAsync(client);
        var (connection, _) = await ConnectAsync();
        await using var _connection = connection;

        await Assert
            .That(() => connection.InvokeAsync("Authenticate", alice.Id, "wrong"))
            .Throws<HubException>();
    }

    [Test]
    public async Task PublishLive_BeforeAuthenticate_IsRejected()
    {
        var (connection, _) = await ConnectAsync();
        await using var _connection = connection;

        await Assert
            .That(() => connection.InvokeAsync("PublishLive", Guid.NewGuid(), payload, iv))
            .Throws<HubException>();
    }

    [Test]
    public async Task PublishLive_WithAnOversizePayload_IsRejected()
    {
        var client = factory.CreateClient();
        var alice = await FeedHelper.CreateUserAsync(client);
        var (connection, _) = await ConnectAsync();
        await using var _connection = connection;
        await connection.InvokeAsync("Authenticate", alice.Id, alice.Password);

        await Assert
            .That(() =>
                connection.InvokeAsync(
                    "PublishLive",
                    Guid.NewGuid(),
                    new byte[16 * 1024],
                    iv
                )
            )
            .Throws<HubException>();
    }

    [Test]
    public async Task Watch_ReturnsTheCachedFrameAndThenStreamsNewOnes()
    {
        var client = factory.CreateClient();
        var (alice, secret) = await CreateTrainerAsync(client);
        var sessionId = Guid.NewGuid();
        var (trainer, _) = await ConnectAsync();
        await using var _trainer = trainer;
        await trainer.InvokeAsync("Authenticate", alice.Id, alice.Password);
        await trainer.InvokeAsync("PublishLive", sessionId, payload, iv);

        var (viewer, received) = await ConnectAsync();
        await using var _viewer = viewer;
        var watched = await viewer.InvokeAsync<WatchLiveResponse>(
            "Watch",
            new[] { secret, "not-a-secret" }
        );

        await Assert.That(watched.Frames).Count().IsEqualTo(1);
        await Assert.That(watched.Frames[0].UserId).IsEqualTo(alice.Id);
        await Assert.That(watched.Frames[0].EventId).IsEqualTo(sessionId);
        await Assert.That(watched.Frames[0].EncryptedEventPayload).IsEquivalentTo(payload);
        await Assert.That(watched.InvalidFollowSecrets).IsEquivalentTo(new[] { "not-a-secret" });

        byte[] updated = [0x09];
        await trainer.InvokeAsync("PublishLive", sessionId, updated, iv);
        await WaitForAsync(() => !received.Frames.IsEmpty);

        await Assert.That(received.Frames.Single().EncryptedEventPayload).IsEquivalentTo(updated);
    }

    [Test]
    public async Task EndLive_BroadcastsAndForgetsTheFrame()
    {
        var client = factory.CreateClient();
        var (alice, secret) = await CreateTrainerAsync(client);
        var sessionId = Guid.NewGuid();
        var (trainer, _) = await ConnectAsync();
        await using var _trainer = trainer;
        await trainer.InvokeAsync("Authenticate", alice.Id, alice.Password);
        await trainer.InvokeAsync("PublishLive", sessionId, payload, iv);
        var (viewer, received) = await ConnectAsync();
        await using var _viewer = viewer;
        await viewer.InvokeAsync<WatchLiveResponse>("Watch", new[] { secret });

        await trainer.InvokeAsync("EndLive", sessionId);
        await WaitForAsync(() => !received.Ended.IsEmpty);

        await Assert.That(received.Ended.Single()).IsEqualTo((alice.Id, sessionId));
        var rewatched = await viewer.InvokeAsync<WatchLiveResponse>("Watch", new[] { secret });
        await Assert.That(rewatched.Frames).IsEmpty();
    }

    [Test]
    public async Task RevokingTheFollowSecret_StopsTheWatcherReceivingFrames()
    {
        var client = factory.CreateClient();
        var (alice, secret) = await CreateTrainerAsync(client);
        var (trainer, _) = await ConnectAsync();
        await using var _trainer = trainer;
        await trainer.InvokeAsync("Authenticate", alice.Id, alice.Password);
        var (viewer, received) = await ConnectAsync();
        await using var _viewer = viewer;
        await viewer.InvokeAsync<WatchLiveResponse>("Watch", new[] { secret });

        (
            await client.PostAsJsonAsync(
                "/follow-secret/delete",
                new DeleteUserFollowSecretRequest(alice.Id, alice.Password, secret)
            )
        ).EnsureSuccessStatusCode();
        await trainer.InvokeAsync("PublishLive", Guid.NewGuid(), payload, iv);
        await Task.Delay(250);

        await Assert.That(received.Frames).IsEmpty();
    }

    [Test]
    public async Task PutInbox_NudgesOnlyTheRecipient()
    {
        var client = factory.CreateClient();
        var alice = await FeedHelper.CreateUserAsync(client);
        var bob = await FeedHelper.CreateUserAsync(client);
        var (aliceConnection, aliceReceived) = await ConnectAsync();
        await using var _alice = aliceConnection;
        await aliceConnection.InvokeAsync("Authenticate", alice.Id, alice.Password);
        var (bobConnection, bobReceived) = await ConnectAsync();
        await using var _bob = bobConnection;
        await bobConnection.InvokeAsync("Authenticate", bob.Id, bob.Password);

        (
            await client.PutAsJsonAsync(
                "/inbox",
                new PutInboxMessageRequest(alice.Id, [[0x01]])
            )
        ).EnsureSuccessStatusCode();
        await WaitForAsync(() => aliceReceived.Nudges > 0);
        await Task.Delay(100);

        await Assert.That(aliceReceived.Nudges).IsEqualTo(1);
        await Assert.That(bobReceived.Nudges).IsEqualTo(0);
    }
}

[ClassDataSource<WebApplicationFactory<Program>>(Shared = SharedType.PerClass)]
public class FeedHubGatingTests(WebApplicationFactory<Program> factory)
{
    [Test]
    public async Task Negotiate_WithTheFeedDisabled_IsLocked()
    {
        var host = TestFactoryHelper.CreateTestFactory(
            factory,
            extraConfiguration: new Dictionary<string, string?>
            {
                [Feature.Feed.EnabledPath()] = "false",
            }
        );

        var response = await host.CreateClient()
            .PostAsync("/feed-hub/negotiate?negotiateVersion=1", null);

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.Locked);
    }
}
