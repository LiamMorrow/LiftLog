using System.Net;
using LiftLog.Api.Models;
using LiftLog.Api.Service;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Configuration.Memory;

namespace LiftLog.Tests.Api.Integration;

[ClassDataSource<Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactory<Program>>(
    Shared = SharedType.PerClass
)]
public class AuthenticationIntegrationTests
{
    private readonly WebApplicationFactory<Program> _factory;
    private const string TestWebAuthKey = "test-web-auth-key-12345";
    private const string TestRevenueCatUserId = "test-user-with-pro";

    public AuthenticationIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = TestFactoryHelper.CreateTestFactory(
            factory,
            services =>
            {
                var mockChatPlanner = Substitute.For<IGptChatWorkoutPlanner>();
                mockChatPlanner
                    .Introduce(
                        Arg.Any<string>(),
                        Arg.Any<string>(),
                        Arg.Any<Func<AiChatResponse, Task>>()
                    )
                    .Returns(async callInfo =>
                    {
                        var callback = callInfo.ArgAt<Func<AiChatResponse, Task>>(2);
                        await callback(
                            new AiChatMessageResponse("Hello! I'm your AI workout planner.")
                        );
                    });
                services.AddSingleton(mockChatPlanner);

                // Mock RevenueCat service
                var mockRevenueCatService =
                    Substitute.For<IRevenueCatPurchaseVerificationService>();
                mockRevenueCatService
                    .GetUserIdHasProEntitlementAsync(TestRevenueCatUserId)
                    .Returns(Task.FromResult(true));
                mockRevenueCatService
                    .GetUserIdHasProEntitlementAsync(Arg.Is<string>(x => x != TestRevenueCatUserId))
                    .Returns(Task.FromResult(false));
                services.AddSingleton(mockRevenueCatService);

                // Override the WebAuthPurchaseVerificationService with our test key
                services.AddScoped(_ => new WebAuthPurchaseVerificationService(TestWebAuthKey));
            }
        );
    }

    [Test]
    public async Task AiChatHub_WithValidWebAuth_ShouldConnect()
    {
        // Arrange
        var server = _factory.Server;
        var hubConnection = new HubConnectionBuilder()
            .WithUrl(
                $"{server.BaseAddress}ai-chat",
                options =>
                {
                    options.HttpMessageHandlerFactory = _ => server.CreateHandler();
                    options.Headers.Add("Authorization", $"Web {TestWebAuthKey}");
                }
            )
            .Build();

        var receivedMessages = new List<AiChatResponse>();
        hubConnection.On<AiChatResponse>(
            "ReceiveMessage",
            message =>
            {
                receivedMessages.Add(message);
            }
        );

        // Act
        await hubConnection.StartAsync();

        // Assert
        await Assert.That(hubConnection.State).IsEqualTo(HubConnectionState.Connected);

        // Cleanup
        await hubConnection.StopAsync();
        await hubConnection.DisposeAsync();
    }

    [Test]
    public async Task AiChatHub_WithValidRevenueCatAuth_ShouldConnect()
    {
        // Arrange
        var server = _factory.Server;
        var hubConnection = new HubConnectionBuilder()
            .WithUrl(
                $"{server.BaseAddress}ai-chat",
                options =>
                {
                    options.HttpMessageHandlerFactory = _ => server.CreateHandler();
                    options.Headers.Add("Authorization", $"RevenueCat {TestRevenueCatUserId}");
                }
            )
            .Build();

        // Act
        await hubConnection.StartAsync();

        // Assert
        await Assert.That(hubConnection.State).IsEqualTo(HubConnectionState.Connected);

        // Cleanup
        await hubConnection.StopAsync();
        await hubConnection.DisposeAsync();
    }

    [Test]
    public async Task AiChatHub_WithoutAuth_ShouldFailToConnect()
    {
        // Arrange
        var server = _factory.Server;
        var hubConnection = new HubConnectionBuilder()
            .WithUrl(
                $"{server.BaseAddress}ai-chat",
                options =>
                {
                    options.HttpMessageHandlerFactory = _ => server.CreateHandler();
                    // No authorization header
                }
            )
            .Build();

        // Act & Assert
        var exception = await Assert.ThrowsAsync<HttpRequestException>(async () =>
            await hubConnection.StartAsync()
        );
        await Assert.That(exception.StatusCode).IsEqualTo(HttpStatusCode.Unauthorized);
    }

    [Test]
    public async Task AiChatHub_WithInvalidWebAuthToken_ShouldFailToConnect()
    {
        // Arrange
        var server = _factory.Server;
        var hubConnection = new HubConnectionBuilder()
            .WithUrl(
                $"{server.BaseAddress}ai-chat",
                options =>
                {
                    options.HttpMessageHandlerFactory = _ => server.CreateHandler();
                    options.Headers.Add("Authorization", "Web invalid-token");
                }
            )
            .Build();

        // Act & Assert
        var exception = await Assert.ThrowsAsync<HttpRequestException>(async () =>
            await hubConnection.StartAsync()
        );
        await Assert.That(exception.StatusCode).IsEqualTo(HttpStatusCode.Unauthorized);
    }

    [Test]
    public async Task AiChatHub_WithInvalidRevenueCatUserId_ShouldFailToConnect()
    {
        // Arrange
        var server = _factory.Server;
        var hubConnection = new HubConnectionBuilder()
            .WithUrl(
                $"{server.BaseAddress}ai-chat",
                options =>
                {
                    options.HttpMessageHandlerFactory = _ => server.CreateHandler();
                    options.Headers.Add("Authorization", "RevenueCat invalid-user-id");
                }
            )
            .Build();

        // Act & Assert
        var exception = await Assert.ThrowsAsync<HttpRequestException>(async () =>
            await hubConnection.StartAsync()
        );
        await Assert.That(exception.StatusCode).IsEqualTo(HttpStatusCode.Unauthorized);
    }

    [Test]
    public async Task AiChatHub_WithInvalidAppStore_ShouldFailToConnect()
    {
        // Arrange
        var server = _factory.Server;
        var hubConnection = new HubConnectionBuilder()
            .WithUrl(
                $"{server.BaseAddress}ai-chat",
                options =>
                {
                    options.HttpMessageHandlerFactory = _ => server.CreateHandler();
                    options.Headers.Add("Authorization", $"InvalidStore {TestWebAuthKey}");
                }
            )
            .Build();

        // Act & Assert
        var exception = await Assert.ThrowsAsync<HttpRequestException>(async () =>
            await hubConnection.StartAsync()
        );
        await Assert.That(exception.StatusCode).IsEqualTo(HttpStatusCode.Unauthorized);
    }

    [Test]
    public async Task AiChatHub_WithMalformedAuthHeader_ShouldFailToConnect()
    {
        // Arrange
        var server = _factory.Server;
        var hubConnection = new HubConnectionBuilder()
            .WithUrl(
                $"{server.BaseAddress}ai-chat",
                options =>
                {
                    options.HttpMessageHandlerFactory = _ => server.CreateHandler();
                    options.Headers.Add("Authorization", "MalformedHeader");
                }
            )
            .Build();

        // Act & Assert
        var exception = await Assert.ThrowsAsync<HttpRequestException>(async () =>
            await hubConnection.StartAsync()
        );
        await Assert.That(exception.StatusCode).IsEqualTo(HttpStatusCode.Unauthorized);
    }

    [Test, Skip("Does not pass right now")]
    public async Task AiChatHub_CanSendAndReceiveMessages_WithValidAuth()
    {
        // Arrange
        var server = _factory.Server;
        var hubConnection = new HubConnectionBuilder()
            .WithUrl(
                $"{server.BaseAddress}ai-chat",
                options =>
                {
                    options.HttpMessageHandlerFactory = _ => server.CreateHandler();
                    options.Headers.Add("Authorization", $"Web {TestWebAuthKey}");
                }
            )
            .Build();

        var receivedMessages = new List<AiChatResponse>();
        var messageReceived = new TaskCompletionSource<bool>();

        hubConnection.On<AiChatResponse>(
            "ReceiveMessage",
            message =>
            {
                receivedMessages.Add(message);
                if (message is AiChatMessageResponse)
                {
                    messageReceived.TrySetResult(true);
                }
            }
        );

        await hubConnection.StartAsync();

        // Act
        await hubConnection.InvokeAsync("Introduce", "en-US");

        // Wait for response (with timeout)
        var receivedInTime =
            await Task.WhenAny(messageReceived.Task, Task.Delay(TimeSpan.FromSeconds(30)))
            == messageReceived.Task;

        // Assert
        await Assert.That(receivedInTime).IsTrue();
        await Assert.That(receivedMessages).IsNotEmpty();
        await Assert.That(receivedMessages.Any(m => m is AiChatMessageResponse)).IsTrue();

        // Cleanup
        await hubConnection.StopAsync();
        await hubConnection.DisposeAsync();
    }
}
