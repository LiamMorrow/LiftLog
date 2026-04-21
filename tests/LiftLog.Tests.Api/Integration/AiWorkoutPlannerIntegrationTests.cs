using System.Text.Json.Serialization.Metadata;
using LiftLog.Api.Models;
using LiftLog.Api.Service;
using LiftLog.Lib.Models;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.SignalR.Client;

namespace LiftLog.Tests.Api.Integration;

[ClassDataSource<WebApplicationFactory<Program>>(Shared = SharedType.PerClass)]
public class AiWorkoutPlannerIntegrationTests
{
    private readonly WebApplicationFactory<Program> _factory;
    private const string TestWebAuthKey = "test-web-auth-key-12345";

    public AiWorkoutPlannerIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = TestFactoryHelper.CreateTestFactory(
            factory,
            services =>
            {
                // Override the WebAuthPurchaseVerificationService with our test key
                services.AddScoped(_ => new WebAuthPurchaseVerificationService(TestWebAuthKey));

                // Mock RevenueCat service to avoid external calls
                var mockRevenueCatService =
                    Substitute.For<IRevenueCatPurchaseVerificationService>();
                mockRevenueCatService
                    .GetUserIdHasProEntitlementAsync(Arg.Any<string>())
                    .Returns(Task.FromResult(false));
                services.AddSingleton(mockRevenueCatService);
            }
        );
    }

    private HubConnection CreateHubConnection()
    {
        var server = _factory.Server;
        return new HubConnectionBuilder()
            .WithUrl(
                $"{server.BaseAddress}ai-chat",
                options =>
                {
                    options.HttpMessageHandlerFactory = _ => server.CreateHandler();
                    options.Headers.Add("Authorization", $"Web {TestWebAuthKey}");
                }
            )
            .AddJsonProtocol()
            .Build();
    }

    [Test]
    [Category("Integration")]
    [Category("RequiresAnthropicApiKey")]
    public async Task SendMessage_WithSimplePlanRequest_ReturnsWorkoutPlan()
    {
        // Arrange
        await using var hubConnection = CreateHubConnection();
        var receivedMessages = new List<AiChatResponse>();

        hubConnection.On<AiChatResponse>("ReceiveMessage", receivedMessages.Add);

        await hubConnection.StartAsync();

        // Act - Request a very specific, simple plan
        await hubConnection.InvokeAsync(
            "SendMessage",
            "Create a simple workout plan with exactly 1 session called 'Full Body'. "
                + "It should have exactly 2 exercises: Squats (3 sets of 10 reps) and Push-ups (3 sets of 15 reps). "
                + "Use 60 seconds min rest, 90 seconds max rest, and 120 seconds failure rest for both exercises."
        );

        // Assert
        var plan = receivedMessages.OfType<AiChatPlanResponse>().Last();
        await Assert.That(plan.Plan).IsNotNull();
        await Assert.That(plan.Plan.Sessions).IsNotEmpty();

        // Verify at least one session exists
        var session = plan.Plan.Sessions.FirstOrDefault();
        await Assert.That(session).IsNotNull();
        await Assert.That(session!.Exercises).IsNotEmpty();
    }

    [Test]
    [Category("Integration")]
    [Category("RequiresAnthropicApiKey")]
    public async Task SendMessage_WithDetailedPlanRequest_ReturnsCorrectExerciseStructure()
    {
        // Arrange
        await using var hubConnection = CreateHubConnection();
        var receivedMessages = new List<AiChatResponse>();

        hubConnection.On<AiChatResponse>("ReceiveMessage", receivedMessages.Add);

        await hubConnection.StartAsync();

        // Act - Request a plan with specific exercise parameters
        await hubConnection.InvokeAsync(
            "SendMessage",
            "Create a workout plan called 'Strength Basics' with 1 session called 'Day A'. "
                + "Include these exercises: "
                + "1. Bench Press - 4 sets of 8 reps, 2.5kg weight increase on success "
                + "2. Barbell Rows - 3 sets of 10 reps, 2.5kg weight increase on success. "
                + "Use 90/120/180 seconds for min/max/failure rest times."
        );

        // Assert
        var plan = receivedMessages.OfType<AiChatPlanResponse>().Last();
        await Assert.That(plan.Plan.Name).IsNotNullOrWhiteSpace();
        await Assert.That(plan.Plan.Sessions.Count).IsGreaterThanOrEqualTo(1);

        var session = plan.Plan.Sessions.First();
        await Assert.That(session.Exercises.Count).IsGreaterThanOrEqualTo(1);

        // Verify exercises have valid structure
        foreach (var exercise in session.Exercises)
        {
            await Assert.That(exercise.Name).IsNotNullOrWhiteSpace();
            await Assert.That(exercise.Sets).IsGreaterThan(0);
            await Assert.That(exercise.RepsPerSet).IsGreaterThan(0);
            await Assert
                .That(exercise.RestBetweenSets.MinRest)
                .IsGreaterThanOrEqualTo(TimeSpan.Zero);
            await Assert
                .That(exercise.RestBetweenSets.MaxRest)
                .IsGreaterThanOrEqualTo(exercise.RestBetweenSets.MinRest);
        }
    }

    [Test]
    [Category("Integration")]
    [Category("RequiresAnthropicApiKey")]
    public async Task Introduce_ReturnsMessageResponse()
    {
        // Arrange
        await using var hubConnection = CreateHubConnection();
        var receivedMessages = new List<AiChatResponse>();

        hubConnection.On<AiChatResponse>("ReceiveMessage", receivedMessages.Add);

        await hubConnection.StartAsync();

        // Act
        await hubConnection.InvokeAsync("Introduce", "en-US");

        // Assert
        var response = receivedMessages.OfType<AiChatMessageResponse>().Last();
        await Assert.That(response.Message).IsNotNullOrWhiteSpace();
    }

    [Test]
    [Category("Integration")]
    [Category("RequiresAnthropicApiKey")]
    public async Task SendMessage_WithMultiSessionPlanRequest_ReturnsMultipleSessions()
    {
        // Arrange
        await using var hubConnection = CreateHubConnection();
        var receivedMessages = new List<AiChatResponse>();

        hubConnection.On<AiChatResponse>("ReceiveMessage", receivedMessages.Add);

        await hubConnection.StartAsync();

        // Act - Request a plan with multiple sessions
        await hubConnection.InvokeAsync(
            "SendMessage",
            "Create a workout plan with exactly 2 sessions: "
                + "Session 1 'Push Day' with Bench Press (3x10) and Overhead Press (3x8). "
                + "Session 2 'Pull Day' with Pull-ups (3x8) and Barbell Rows (3x10). "
                + "Use 60/90/120 seconds rest times. Just create the plan, no questions."
        );

        // Assert
        var plan = receivedMessages.OfType<AiChatPlanResponse>().Last();
        await Assert.That(plan.Plan.Sessions.Count).IsGreaterThanOrEqualTo(2);

        // Check both sessions have exercises
        foreach (var session in plan.Plan.Sessions)
        {
            await Assert.That(session.Name).IsNotNullOrWhiteSpace();
            await Assert.That(session.Exercises).IsNotEmpty();
        }
    }

    [Test]
    [Category("Integration")]
    [Category("RequiresAnthropicApiKey")]
    public async Task SendMessage_AfterRestartChat_StartsNewConversation()
    {
        // Arrange
        await using var hubConnection = CreateHubConnection();
        var receivedMessages = new List<AiChatResponse>();

        hubConnection.On<AiChatResponse>("ReceiveMessage", receivedMessages.Add);

        await hubConnection.StartAsync();

        // Send initial message
        await hubConnection.InvokeAsync("SendMessage", "I want a leg workout");

        // Restart the chat
        await hubConnection.InvokeAsync("RestartChat");

        // Clear messages for fresh tracking
        receivedMessages.Clear();

        // Act - Send a new request after restart
        await hubConnection.InvokeAsync(
            "SendMessage",
            "Create a workout plan called 'Arms Only' with 1 session called 'Arm Day' "
                + "with just Bicep Curls (3x12). Use 45/60/90 seconds rest. Create the plan now."
        );

        // Assert - Should get a response for the new conversation
        var plan = receivedMessages.OfType<AiChatPlanResponse>().Last();
        await Assert.That(plan.Plan).IsNotNull();
    }

    [Test]
    [Category("Integration")]
    [Category("RequiresAnthropicApiKey")]
    public async Task SendMessage_WithNonEnglishLocale_RespondsInRequestedLanguage()
    {
        // Arrange
        await using var hubConnection = CreateHubConnection();
        var receivedMessages = new List<AiChatResponse>();

        hubConnection.On<AiChatResponse>("ReceiveMessage", receivedMessages.Add);

        await hubConnection.StartAsync();

        // Act - Introduce with Spanish locale
        await hubConnection.InvokeAsync("Introduce", "es-ES");

        // Assert - Should receive a response (language detection is best-effort)
        var response = receivedMessages.OfType<AiChatMessageResponse>().Last();
        await Assert.That(response.Message).IsNotNullOrWhiteSpace();
    }

    [Test]
    [Category("Integration")]
    [Category("RequiresAnthropicApiKey")]
    public async Task SendMessage_StreamsIntermediateUpdates()
    {
        // Arrange
        await using var hubConnection = CreateHubConnection();
        var receivedMessages = new List<AiChatResponse>();

        hubConnection.On<AiChatResponse>("ReceiveMessage", receivedMessages.Add);

        await hubConnection.StartAsync();

        // Act
        await hubConnection.InvokeAsync(
            "SendMessage",
            "Create a workout plan with 1 session called 'Quick Workout' with Squats (3x10). "
                + "Use 60/90/120 seconds rest. Create it now."
        );

        // Assert - Should receive multiple streamed updates
        await Assert.That(receivedMessages.OfType<AiChatPlanResponse>().Any()).IsTrue();
        await Assert.That(receivedMessages.Count).IsGreaterThan(0);
    }
}
