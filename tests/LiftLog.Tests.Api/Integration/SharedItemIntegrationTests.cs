using System.Net;
using System.Net.Http.Json;
using LiftLog.Lib.Models;
using LiftLog.Lib.Services;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Visus.Cuid;

namespace LiftLog.Tests.ApiErrorType.Integration;

[ClassDataSource<Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactory<Program>>(
    Shared = SharedType.PerClass
)]
public class SharedItemIntegrationTests(WebApplicationFactory<Program> factory)
{
    const string url = "/shareditem";
    private static readonly AesEncryptedAndRsaSignedData encryptedPayload = new(
        [0x01, 0x02, 0x03],
        new(Enumerable.Repeat((byte)0x04, 16).ToArray())
    );
    private static readonly byte[] rsaPublicKey = Enumerable.Repeat((byte)0x05, 16).ToArray();
    private readonly WebApplicationFactory<Program> _factory = factory.WithWebHostBuilder(builder =>
    {
        builder.ConfigureAppConfiguration(
            (context, config) =>
            {
                // Get the path to the test project's output directory
                var testProjectPath = Directory.GetCurrentDirectory();
                var appsettingsPath = Path.Combine(testProjectPath, "appsettings.json");
                config.AddJsonFile(appsettingsPath, optional: false, reloadOnChange: false);
            }
        );
        builder.ConfigureServices(services =>
        {
            // Set TEST_MODE environment variable for rate limiting bypass in some scenarios
            Environment.SetEnvironmentVariable("TEST_MODE", "True");
        });
    });

    [Test]
    public async Task Post_SharedItemGivesAnId()
    {
        // Arrange
        var client = _factory.CreateClient();

        var createUserResponse = await UserHelper.CreateUserAsync(
            client,
            encryptedPayload.IV.Value,
            rsaPublicKey
        );

        var sharedItemCreateRequest = new CreateSharedItemRequest(
            createUserResponse.Id,
            createUserResponse.Password,
            encryptedPayload,
            DateTimeOffset.UtcNow.AddDays(1)
        );

        // Act
        var response = await client.PostAsJsonAsync(url, sharedItemCreateRequest);

        // Assert
        response.EnsureSuccessStatusCode(); // Status Code 200-299
        var responseBody = await response.Content.ReadFromJsonAsync<CreateSharedItemResponse>();

        await Assert.That(responseBody).IsNotNull();
        await Assert.That(responseBody!.Id).IsNotEmpty();

        var getSharedItemResponse = await client.GetFromJsonAsync<GetSharedItemResponse>(
            url + "/" + responseBody.Id
        );

        await Assert.That(getSharedItemResponse).IsNotNull();
        await Assert
            .That(getSharedItemResponse!.RsaPublicKey.SpkiPublicKeyBytes)
            .IsEquivalentTo(rsaPublicKey);
        await Assert.That(getSharedItemResponse.EncryptedPayload).IsEquivalentTo(encryptedPayload);
    }

    [Test]
    public async Task Post_SharedItemWithInvalidUserId_ReturnsUnauthorized()
    {
        // Arrange
        var client = _factory.CreateClient();

        var sharedItemCreateRequest = new CreateSharedItemRequest(
            Guid.NewGuid(),
            "password",
            encryptedPayload,
            DateTimeOffset.UtcNow.AddDays(1)
        );

        // Act
        var response = await client.PostAsJsonAsync(url, sharedItemCreateRequest);

        // Assert
        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.Unauthorized);
    }

    [Test]
    public async Task Post_SharedItemWithInvalidPassword_ReturnsUnauthorized()
    {
        // Arrange
        var client = _factory.CreateClient();

        var createUserResponse = await UserHelper.CreateUserAsync(
            client,
            encryptedPayload.IV.Value,
            rsaPublicKey
        );

        var sharedItemCreateRequest = new CreateSharedItemRequest(
            createUserResponse.Id,
            new string('a', 29),
            encryptedPayload,
            DateTimeOffset.UtcNow.AddDays(1)
        );

        // Act
        var response = await client.PostAsJsonAsync(url, sharedItemCreateRequest);

        // Assert
        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.Unauthorized);
    }

    [Test]
    public async Task Get_SharedItemWithNonExistantId_ReturnsNotFound()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync(url + "/" + new Cuid2(12).ToString());

        // Assert
        await Assert.That(response.StatusCode).IsEqualTo(HttpStatusCode.NotFound);
    }
}
