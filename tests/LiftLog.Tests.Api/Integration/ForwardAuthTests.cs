using System.Net;
using System.Text;
using LiftLog.Api.Authentication;
using LiftLog.Api.Service.Backup;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace LiftLog.Tests.Api.Integration;

/// <summary>
/// TestServer leaves the peer address unset, so the trusted-proxy check has nothing to match on.
/// This puts one in front of the pipeline.
/// </summary>
internal sealed class PeerAddressStartupFilter(IPAddress? peer) : IStartupFilter
{
    public Action<IApplicationBuilder> Configure(Action<IApplicationBuilder> next) =>
        app =>
        {
            app.Use(
                (context, nextMiddleware) =>
                {
                    context.Connection.RemoteIpAddress = peer;
                    return nextMiddleware();
                }
            );
            next(app);
        };
}

[ClassDataSource<WebApplicationFactory<Program>>(Shared = SharedType.PerClass)]
public class ForwardAuthTests(WebApplicationFactory<Program> factory)
{
    private const string UserHeader = "Remote-User";

    private static (WebApplicationFactory<Program> Factory, RecordingBackupSink Sink) Create(
        WebApplicationFactory<Program> factory,
        string? userHeader = UserHeader,
        string? trustedProxies = null,
        string? peer = null
    )
    {
        var sink = new RecordingBackupSink();
        var configured = TestFactoryHelper.CreateTestFactory(
            factory,
            services =>
            {
                services.AddSingleton<IBackupSink>(sink);
                services.AddSingleton<IStartupFilter>(
                    new PeerAddressStartupFilter(peer is null ? null : IPAddress.Parse(peer))
                );
            },
            extraConfiguration: new Dictionary<string, string?>
            {
                [AuthConfiguration.ForwardAuth.UserHeaderPath] = userHeader,
                [AuthConfiguration.ForwardAuth.TrustedProxiesPath] = trustedProxies,
            }
        );
        return (configured, sink);
    }

    private static HttpRequestMessage Request(string? user, string payload)
    {
        var request = BackupTestFactory.Request(apiKey: null, payload);
        if (user is not null)
        {
            request.Headers.TryAddWithoutValidation(UserHeader, user);
        }
        return request;
    }

    [Test]
    public async Task Post_WithForwardedUser_UploadsUnderThatUser()
    {
        var (server, sink) = Create(factory);

        var response = await server.CreateClient().SendAsync(Request("alice", "payload-alice"));

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.OK);
        await Assert.That(sink.Uploads.Single().BackupName).IsEqualTo("alice");
    }

    [Test]
    public async Task Post_WithoutForwardedUser_IsUnauthorizedAndDoesNotUpload()
    {
        var (server, sink) = Create(factory);

        var response = await server.CreateClient().SendAsync(Request(user: null, "payload-none"));

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.Unauthorized);
        await Assert.That(sink.Uploads).IsEmpty();
    }

    [Test]
    public async Task Post_WithEmptyForwardedUser_IsUnauthorizedAndDoesNotUpload()
    {
        var (server, sink) = Create(factory);

        var response = await server.CreateClient().SendAsync(Request("", "payload-empty"));

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.Unauthorized);
        await Assert.That(sink.Uploads).IsEmpty();
    }

    [Test]
    public async Task Post_WhenNoUserHeaderIsConfigured_IgnoresTheHeaderEntirely()
    {
        var (server, sink) = Create(factory, userHeader: null);

        var response = await server.CreateClient().SendAsync(Request("alice", "payload-off"));

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.Unauthorized);
        await Assert.That(sink.Uploads).IsEmpty();
    }

    [Test]
    [Arguments("10.0.0.0/8", "10.1.2.3")]
    [Arguments("192.168.1.0/24, 10.0.0.0/8", "10.1.2.3")]
    [Arguments("10.1.2.3", "10.1.2.3")]
    [Arguments("10.0.0.0/8", "::ffff:10.1.2.3")]
    public async Task Post_FromATrustedProxy_Uploads(string trustedProxies, string peer)
    {
        var (server, sink) = Create(factory, trustedProxies: trustedProxies, peer: peer);

        var response = await server.CreateClient().SendAsync(Request("alice", "payload-trusted"));

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.OK);
        await Assert.That(sink.Uploads.Single().BackupName).IsEqualTo("alice");
    }

    [Test]
    [Arguments("not-a-network")]
    [Arguments("10.0.0.0/99")]
    public async Task AMalformedTrustedProxyRange_FailsTheHostAtStartup(string trustedProxies)
    {
        var (server, _) = Create(factory, trustedProxies: trustedProxies);

        var exception = Assert.Throws<InvalidOperationException>(() => server.CreateClient());

        await Assert.That(exception!.Message).Contains(trustedProxies);
    }

    [Test]
    [Arguments("10.0.0.0/8", "192.168.1.1")]
    [Arguments("10.1.2.3", "10.1.2.4")]
    [Arguments("10.0.0.0/8", null)]
    public async Task Post_FromAnUntrustedProxy_IsUnauthorizedAndDoesNotUpload(
        string trustedProxies,
        string? peer
    )
    {
        var (server, sink) = Create(factory, trustedProxies: trustedProxies, peer: peer);

        var response = await server.CreateClient().SendAsync(Request("alice", "payload-untrusted"));

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.Unauthorized);
        await Assert.That(sink.Uploads).IsEmpty();
    }
}
