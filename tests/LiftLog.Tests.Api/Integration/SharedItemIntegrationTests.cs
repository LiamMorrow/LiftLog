using System.Net;
using LiftLog.Api.Service;
using LiftLog.Lib.Models;
using Microsoft.AspNetCore.Mvc.Testing;

namespace LiftLog.Tests.ApiErrorType.Integration;

public class SharedItemIntegrationTests(WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    const string url = "/shareditem";
    private static readonly byte[] encryptedPayload = new byte[] { 0x01, 0x02, 0x03 };
    private static readonly byte[] encryptionIV = Enumerable.Repeat((byte)0x04, 16).ToArray();
    private static readonly byte[] rsaPublicKey = Enumerable.Repeat((byte)0x05, 16).ToArray();
    private readonly WebApplicationFactory<Program> _factory = factory;

    [Fact]
    public async Task Post_SharedItemGivesAnId()
    {
        // Arrange
        var client = _factory.CreateClient();

        var createUserResponse = await UserHelper.CreateUserAsync(
            client,
            encryptionIV,
            rsaPublicKey
        );

        var sharedItemCreateRequest = new CreateSharedItemRequest(
            createUserResponse.Id,
            createUserResponse.Password,
            new(encryptedPayload, new(encryptionIV)),
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
        getSharedItemResponse
            .EncryptedPayload.EncryptedPayload.Should()
            .BeEquivalentTo(encryptedPayload);
        getSharedItemResponse.EncryptedPayload.IV.Should().BeEquivalentTo(encryptionIV);
    }

    [Fact]
    public async Task Post_SharedItemWithInvalidUserId_ReturnsUnauthorized()
    {
        // Arrange
        var client = _factory.CreateClient();

        var sharedItemCreateRequest = new CreateSharedItemRequest(
            Guid.NewGuid(),
            "password",
            new(encryptedPayload, new(encryptionIV)),
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
            encryptionIV,
            rsaPublicKey
        );

        var sharedItemCreateRequest = new CreateSharedItemRequest(
            createUserResponse.Id,
            new string('a', 29),
            new(encryptedPayload, new(encryptionIV)),
            DateTimeOffset.UtcNow.AddDays(1)
        );

        // Act
        var response = await client.PostAsJsonAsync(url, sharedItemCreateRequest);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Get_SharedItemWithInvalidId_ReturnsNotFound()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync(url + "/" + Guid.NewGuid());

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Get_SharedItemWithValidNonExistantId_ReturnsNotFound()
    {
        // Arrange
        var client = _factory.CreateClient();
        var encodedId = _factory
            .Services.GetRequiredService<IdEncodingService>()
            .EncodeId(int.MaxValue);

        // Act
        var response = await client.GetAsync(url + "/" + encodedId);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
