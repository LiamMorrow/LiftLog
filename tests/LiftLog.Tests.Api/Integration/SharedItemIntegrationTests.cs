using System.Net;
using Google.Apis.AndroidPublisher.v3;
using LiftLog.Api.Service;
using LiftLog.Lib.Models;
using LiftLog.Lib.Services;
using Microsoft.AspNetCore.Mvc.Testing;
using Visus.Cuid;

namespace LiftLog.Tests.ApiErrorType.Integration;

public class SharedItemIntegrationTests(WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    const string url = "/shareditem";
    private static readonly AesEncryptedAndRsaSignedData encryptedPayload = new(
        [0x01, 0x02, 0x03],
        new(Enumerable.Repeat((byte)0x04, 16).ToArray())
    );
    private static readonly byte[] rsaPublicKey = Enumerable.Repeat((byte)0x05, 16).ToArray();
    private readonly WebApplicationFactory<Program> _factory = factory.WithWebHostBuilder(builder =>
    {
        builder.ConfigureServices(services =>
        {
            services.AddScoped((a) => Substitute.For<AndroidPublisherService>());

            // Set TEST_MODE environment variable for rate limiting bypass in some scenarios
            Environment.SetEnvironmentVariable("TEST_MODE", "True");
        });
    });

    [Fact]
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

        responseBody.Should().NotBeNull();
        responseBody!.Id.Should().NotBeEmpty();

        var getSharedItemResponse = await client.GetFromJsonAsync<GetSharedItemResponse>(
            url + "/" + responseBody.Id
        );

        getSharedItemResponse.Should().NotBeNull();
        getSharedItemResponse!
            .RsaPublicKey.SpkiPublicKeyBytes.Should()
            .BeEquivalentTo(rsaPublicKey);
        getSharedItemResponse.EncryptedPayload.Should().BeEquivalentTo(encryptedPayload);
    }

    [Fact]
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
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
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
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Get_SharedItemWithNonExistantId_ReturnsNotFound()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync(url + "/" + new Cuid2(12).ToString());

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
