using System.Collections.Immutable;
using System.Net;
using System.Net.Http.Headers;
using FluentAssertions;
using Google.Apis.AndroidPublisher.v3;
using LiftLog.Api.Service;
using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Lib.Services;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using NSubstitute.ExceptionExtensions;

namespace LiftLog.Tests.Api.Integration;

public class AuthenticationIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly IAiWorkoutPlanner _mockAiWorkoutPlanner;
    private const string TestWebAuthKey = "test-web-auth-key-12345";

    public AuthenticationIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Override the WebAuthPurchaseVerificationService with our test key
                services.AddScoped(_ => new WebAuthPurchaseVerificationService(TestWebAuthKey));
                var mockAiWorkoutPlanner = Substitute.For<IAiWorkoutPlanner>();
                mockAiWorkoutPlanner
                    .GenerateWorkoutPlanAsync(default!)
                    .ThrowsAsyncForAnyArgs(new Exception());
                mockAiWorkoutPlanner
                    .GenerateSessionAsync(default!)
                    .ThrowsAsyncForAnyArgs(new Exception());
                services.AddScoped((a) => Substitute.For<AndroidPublisherService>());
                services.AddSingleton((a) => mockAiWorkoutPlanner);

                // Set TEST_MODE environment variable for rate limiting bypass in some scenarios
                Environment.SetEnvironmentVariable("TEST_MODE", "True");
            });
        });
        _client = _factory.CreateClient();
        _mockAiWorkoutPlanner = _factory.Services.GetRequiredService<IAiWorkoutPlanner>();
    }

    [Fact]
    public async Task GenerateAiWorkout_WithValidWebAuth_ShouldReturnSuccess()
    {
        // Arrange
        var authHeader = $"Web {TestWebAuthKey}";
        _client.DefaultRequestHeaders.Authorization = AuthenticationHeaderValue.Parse(authHeader);
        _mockAiWorkoutPlanner
            .GenerateWorkoutPlanAsync(default!)
            .ReturnsForAnyArgs(Task.FromResult(new AiWorkoutPlan("Test", "Plan", [])));

        var request = new GenerateAiWorkoutPlanRequest(
            new AiWorkoutAttributes(
                Gender.Male,
                "70-80kg",
                25,
                3,
                ["Build muscle", "Increase strength"],
                Experience.Intermediate,
                false,
                "No additional info"
            ),
            null // Auth is now in header, not body
        );

        // Act
        var response = await _client.PostAsJsonAsync("/ai/workout", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().NotBeEmpty();
        content.Should().Be("""{"name":"Test","description":"Plan","sessions":[]}""");
    }

    [Fact]
    public async Task GenerateAiSession_WithValidWebAuth_ShouldReturnSuccess()
    {
        // Arrange
        var authHeader = $"Web {TestWebAuthKey}";
        _client.DefaultRequestHeaders.Authorization = AuthenticationHeaderValue.Parse(authHeader);
        _mockAiWorkoutPlanner
            .GenerateSessionAsync(default!)
            .ReturnsForAnyArgs(Task.FromResult(new SessionBlueprint("Test", [], "Notes")));

        var request = new GenerateAiSessionRequest(
            new AiSessionAttributes(
                ["Chest", "Back"],
                5,
                new Dictionary<string, decimal> { ["Bench Press"] = 80m }.ToImmutableDictionary(),
                false,
                "Focus on compound movements"
            ),
            null // Auth is now in header, not body
        );

        // Act
        var response = await _client.PostAsJsonAsync("/ai/session", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        content.Should().NotBeEmpty();
        content.Should().Be("""{"name":"Test","exercises":[],"notes":"Notes"}""");
    }

    [Fact]
    public async Task GenerateAiWorkout_WithoutAuth_ShouldReturnUnauthorized()
    {
        // Arrange - no auth header set
        var request = new GenerateAiWorkoutPlanRequest(
            new AiWorkoutAttributes(
                Gender.Male,
                "70-80kg",
                25,
                3,
                ["Build muscle"],
                Experience.Beginner,
                false,
                ""
            ),
            null
        );

        // Act
        var response = await _client.PostAsJsonAsync("/ai/workout", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GenerateAiWorkout_WithInvalidAuthToken_ShouldReturnUnauthorized()
    {
        // Arrange
        var authHeader = "Web invalid-token";
        _client.DefaultRequestHeaders.Authorization = AuthenticationHeaderValue.Parse(authHeader);

        var request = new GenerateAiWorkoutPlanRequest(
            new AiWorkoutAttributes(
                Gender.Female,
                "60-70kg",
                30,
                4,
                ["Lose weight"],
                Experience.Beginner,
                false,
                ""
            ),
            null
        );

        // Act
        var response = await _client.PostAsJsonAsync("/ai/workout", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GenerateAiWorkout_WithInvalidAppStore_ShouldReturnUnauthorized()
    {
        // Arrange
        var authHeader = $"InvalidStore {TestWebAuthKey}";
        _client.DefaultRequestHeaders.Authorization = AuthenticationHeaderValue.Parse(authHeader);

        var request = new GenerateAiWorkoutPlanRequest(
            new AiWorkoutAttributes(
                Gender.Other,
                "80-90kg",
                28,
                5,
                ["General fitness"],
                Experience.Advanced,
                true,
                ""
            ),
            null
        );

        // Act
        var response = await _client.PostAsJsonAsync("/ai/workout", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GenerateAiWorkout_WithMalformedAuthHeader_ShouldReturnUnauthorized()
    {
        // Arrange
        var authHeader = "MalformedHeader";
        _client.DefaultRequestHeaders.Authorization = AuthenticationHeaderValue.Parse(authHeader);

        var request = new GenerateAiWorkoutPlanRequest(
            new AiWorkoutAttributes(
                Gender.PreferNotToSay,
                "70kg",
                35,
                3,
                ["Health"],
                Experience.Professional,
                false,
                "Test"
            ),
            null
        );

        // Act
        var response = await _client.PostAsJsonAsync("/ai/workout", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GenerateAiWorkout_WithEmptyAuthHeader_ShouldReturnUnauthorized()
    {
        // Arrange
        _client.DefaultRequestHeaders.Clear();

        var request = new GenerateAiWorkoutPlanRequest(
            new AiWorkoutAttributes(
                Gender.Female,
                "65kg",
                22,
                3,
                ["Tone"],
                Experience.Beginner,
                true,
                ""
            ),
            null
        );

        // Act
        var response = await _client.PostAsJsonAsync("/ai/workout", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GenerateAiSession_WithoutAuth_ShouldReturnUnauthorized()
    {
        // Arrange - no auth header
        var request = new GenerateAiSessionRequest(
            new AiSessionAttributes(
                ["Legs"],
                3,
                new Dictionary<string, decimal> { ["Squat"] = 100m }.ToImmutableDictionary(),
                false,
                ""
            ),
            null
        );

        // Act
        var response = await _client.PostAsJsonAsync("/ai/session", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GenerateAiWorkout_WithValidationErrors_ShouldReturnBadRequest()
    {
        // Arrange
        var authHeader = $"Web {TestWebAuthKey}";
        _client.DefaultRequestHeaders.Authorization = AuthenticationHeaderValue.Parse(authHeader);

        // Create an invalid request (empty goals list should trigger validation error)
        var request = new GenerateAiWorkoutPlanRequest(
            new AiWorkoutAttributes(Gender.Male, "70kg", 25, 3, [], Experience.Beginner, false, ""),
            null
        );

        // Act
        var response = await _client.PostAsJsonAsync("/ai/workout", request);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
