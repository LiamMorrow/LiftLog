using System.Net;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using System.Text.Encodings.Web;
using LiftLog.Api.Authentication;
using LiftLog.Api.Service.Backup;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;

namespace LiftLog.Tests.Api.Integration;

internal static class BackupTestFactory
{
    public const string ApiKeyHeader = "X-API-Key";

    public static WebApplicationFactory<Program> Create(
        WebApplicationFactory<Program> factory,
        string? backupApiKey,
        IBackupSink? sink,
        Action<IServiceCollection>? configureServices = null,
        IReadOnlyDictionary<string, string?>? extraConfiguration = null
    ) =>
        TestFactoryHelper
            .CreateTestFactory(
                factory,
                services =>
                {
                    if (sink is not null)
                    {
                        services.AddSingleton(sink);
                    }
                    configureServices?.Invoke(services);
                },
                extraConfiguration
            )
            .WithWebHostBuilder(builder =>
                builder.ConfigureAppConfiguration(
                    (_, config) =>
                        config.AddInMemoryCollection(
                            new Dictionary<string, string?>
                            {
                                [AuthConfiguration.ApiKey.ValuePath] = backupApiKey,
                            }
                        )
                )
            );

    public static HttpRequestMessage Request(string? apiKey, string payload)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, "/backup")
        {
            Content = new ByteArrayContent(Encoding.UTF8.GetBytes(payload)),
        };
        request.Content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
        if (apiKey is not null)
        {
            request.Headers.TryAddWithoutValidation(ApiKeyHeader, apiKey);
        }
        return request;
    }
}

[ClassDataSource<WebApplicationFactory<Program>>(Shared = SharedType.PerClass)]
public class BackupControllerAuthTests
{
    private const string ValidApiKey = "test-backup-api-key-12345";

    private readonly RecordingBackupSink _sink;
    private readonly WebApplicationFactory<Program> _factory;

    public BackupControllerAuthTests(WebApplicationFactory<Program> factory)
    {
        _sink = new RecordingBackupSink();
        _factory = BackupTestFactory.Create(factory, ValidApiKey, _sink);
    }

    private RecordedBackup? UploadOf(string payload) =>
        _sink.Uploads.SingleOrDefault(x => Encoding.UTF8.GetString(x.Contents) == payload);

    [Test]
    public async Task Post_WithValidApiKey_UploadsBodyUnderAuthenticatedUserName()
    {
        var client = _factory.CreateClient();

        var response = await client.SendAsync(
            BackupTestFactory.Request(ValidApiKey, "payload-valid-key")
        );

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.OK);
        var upload = UploadOf("payload-valid-key");
        await Assert.That(upload).IsNotNull();
        await Assert.That(upload!.BackupName).IsNotNull();
        await Assert.That(upload.BackupName).IsEqualTo("default");
    }

    [Test]
    public async Task Post_WithoutApiKeyHeader_IsUnauthorizedAndDoesNotUpload()
    {
        var client = _factory.CreateClient();

        var response = await client.SendAsync(
            BackupTestFactory.Request(apiKey: null, "payload-no-header")
        );

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.Unauthorized);
        await Assert.That(UploadOf("payload-no-header")).IsNull();
    }

    [Test]
    public async Task Post_WithEmptyApiKeyHeader_IsUnauthorizedAndDoesNotUpload()
    {
        var client = _factory.CreateClient();

        var response = await client.SendAsync(BackupTestFactory.Request("", "payload-empty-key"));

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.Unauthorized);
        await Assert.That(UploadOf("payload-empty-key")).IsNull();
    }

    [Test]
    public async Task Post_WithIncorrectApiKey_IsUnauthorizedAndDoesNotUpload()
    {
        var client = _factory.CreateClient();

        var response = await client.SendAsync(
            BackupTestFactory.Request("not-the-api-key", "payload-wrong-key")
        );

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.Unauthorized);
        await Assert.That(UploadOf("payload-wrong-key")).IsNull();
    }

    [Test]
    [Arguments("TEST-BACKUP-API-KEY-12345")]
    [Arguments(" test-backup-api-key-12345")]
    [Arguments("test-backup-api-key-12345 ")]
    [Arguments("test-backup-api-key-1234")]
    [Arguments("test-backup-api-key-123456")]
    public async Task Post_WithNearMissApiKey_IsUnauthorized(string apiKey)
    {
        var client = _factory.CreateClient();

        var response = await client.SendAsync(
            BackupTestFactory.Request(apiKey, $"payload-near-miss-{apiKey}")
        );

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.Unauthorized);
        await Assert.That(UploadOf($"payload-near-miss-{apiKey}")).IsNull();
    }

    [Test]
    public async Task Post_WithApiKeyInAuthorizationHeaderInstead_IsUnauthorized()
    {
        var client = _factory.CreateClient();
        var request = BackupTestFactory.Request(apiKey: null, "payload-auth-header");
        request.Headers.TryAddWithoutValidation("Authorization", $"Bearer {ValidApiKey}");

        var response = await client.SendAsync(request);

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.Unauthorized);
        await Assert.That(UploadOf("payload-auth-header")).IsNull();
    }

    [Test]
    public async Task Post_WithValidPurchaseTokenButNoApiKey_IsUnauthorized()
    {
        var client = _factory.CreateClient();
        var request = BackupTestFactory.Request(apiKey: null, "payload-purchase-token");
        request.Headers.TryAddWithoutValidation("Authorization", "Web test-web-auth-key-12345");

        var response = await client.SendAsync(request);

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.Unauthorized);
        await Assert.That(UploadOf("payload-purchase-token")).IsNull();
    }

    [Test]
    public async Task Post_WithValidApiKeyAndGarbagePurchaseToken_StillUploads()
    {
        var client = _factory.CreateClient();
        var request = BackupTestFactory.Request(ValidApiKey, "payload-mixed-auth");
        request.Headers.TryAddWithoutValidation("Authorization", "Web nonsense");

        var response = await client.SendAsync(request);

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.OK);
        await Assert.That(UploadOf("payload-mixed-auth")).IsNotNull();
    }
}

[ClassDataSource<WebApplicationFactory<Program>>(Shared = SharedType.PerClass)]
public class BackupControllerUnconfiguredApiKeyTests
{
    private readonly RecordingBackupSink _sink;
    private readonly WebApplicationFactory<Program> _factory;

    public BackupControllerUnconfiguredApiKeyTests(WebApplicationFactory<Program> factory)
    {
        _sink = new RecordingBackupSink();
        _factory = BackupTestFactory.Create(factory, backupApiKey: "", _sink);
    }

    [Test]
    [Arguments(null)]
    [Arguments("")]
    [Arguments("any-key")]
    public async Task Post_WhenNoApiKeyIsConfigured_IsUnauthorized(string? apiKey)
    {
        var client = _factory.CreateClient();

        var response = await client.SendAsync(
            BackupTestFactory.Request(apiKey, "payload-unconfigured")
        );

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.Unauthorized);
        await Assert.That(_sink.Uploads).IsEmpty();
    }
}

[ClassDataSource<WebApplicationFactory<Program>>(Shared = SharedType.PerClass)]
public class BackupControllerNoSinkTests
{
    private const string ValidApiKey = "test-backup-api-key-12345";

    private readonly WebApplicationFactory<Program> _factory;

    public BackupControllerNoSinkTests(WebApplicationFactory<Program> factory)
    {
        _factory = BackupTestFactory.Create(factory, ValidApiKey, sink: null);
    }

    [Test]
    public async Task Post_WithValidApiKeyButNoSinkConfigured_IsUnprocessableEntity()
    {
        var client = _factory.CreateClient();

        var response = await client.SendAsync(
            BackupTestFactory.Request(ValidApiKey, "payload-no-sink")
        );

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.UnprocessableEntity);
    }

    [Test]
    public async Task Post_WithoutApiKeyAndNoSinkConfigured_IsUnauthorized()
    {
        var client = _factory.CreateClient();

        var response = await client.SendAsync(
            BackupTestFactory.Request(apiKey: null, "payload-no-sink-anon")
        );

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.Unauthorized);
    }
}

internal sealed class NamelessApiKeyAuthenticationHandler(
    IOptionsMonitor<ApiKeyAuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder
) : AuthenticationHandler<ApiKeyAuthenticationSchemeOptions>(options, logger, encoder)
{
    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (
            !Request.Headers.TryGetValue(BackupTestFactory.ApiKeyHeader, out var value)
            || value.FirstOrDefault() != Options.ApiKey
        )
        {
            return Task.FromResult(AuthenticateResult.Fail("X-API-Key incorrect"));
        }

        var principal = new ClaimsPrincipal(new ClaimsIdentity([], Scheme.Name));
        return Task.FromResult(
            AuthenticateResult.Success(new AuthenticationTicket(principal, Scheme.Name))
        );
    }
}

[ClassDataSource<WebApplicationFactory<Program>>(Shared = SharedType.PerClass)]
public class BackupControllerNamelessPrincipalTests
{
    private const string ValidApiKey = "test-backup-api-key-12345";

    private readonly RecordingBackupSink _sink;
    private readonly WebApplicationFactory<Program> _factory;

    public BackupControllerNamelessPrincipalTests(WebApplicationFactory<Program> factory)
    {
        _sink = new RecordingBackupSink();
        _factory = BackupTestFactory.Create(
            factory,
            ValidApiKey,
            _sink,
            services =>
            {
                services.AddTransient<NamelessApiKeyAuthenticationHandler>();
                services.PostConfigure<AuthenticationOptions>(options =>
                    options.SchemeMap[ApiKeyAuthenticationSchemeOptions.SchemeName].HandlerType =
                        typeof(NamelessApiKeyAuthenticationHandler)
                );
            }
        );
    }

    [Test]
    public async Task Post_WhenAuthenticatedPrincipalHasNoName_IsUnauthorizedAndDoesNotUpload()
    {
        var client = _factory.CreateClient();

        var response = await client.SendAsync(
            BackupTestFactory.Request(ValidApiKey, "payload-nameless")
        );

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.Unauthorized);
        await Assert.That(_sink.Uploads).IsEmpty();
    }

    [Test]
    public async Task Post_WhenAuthenticationFails_IsUnauthorizedAndDoesNotUpload()
    {
        var client = _factory.CreateClient();

        var response = await client.SendAsync(
            BackupTestFactory.Request("wrong-key", "payload-nameless-bad-key")
        );

        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.Unauthorized);
        await Assert.That(_sink.Uploads).IsEmpty();
    }
}
