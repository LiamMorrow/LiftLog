namespace LiftLog.Api.Service;

using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Anthropic;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Kiota.Abstractions.Authentication;
using Microsoft.Kiota.Http.HttpClientLibrary;
using RevenueCat.Client;

public static class RegistrationHelpers
{
    /// <summary>
    /// Registers the AI Workout Planner using Microsoft.Extensions.AI abstractions
    /// backed by Anthropic's Claude model. This is provider-agnostic and can be
    /// easily swapped to use other AI providers.
    /// </summary>
    public static IServiceCollection AddAnthropicWorkoutPlanner(this IServiceCollection source)
    {
        // Register the Anthropic client as IChatClient
        source.AddSingleton<IChatClient>(services =>
        {
            var configuration = services.GetRequiredService<IConfiguration>();
            var apiKey =
                configuration.GetValue<string?>("AnthropicApiKey")
                ?? throw new Exception("AnthropicApiKey configuration is not set.");

            var anthropicClient = new AnthropicClient { ApiKey = apiKey };

            // Use claude-sonnet-4-6 as a good balance of capability and cost
            // Can be configured via configuration if needed
            var modelId =
                configuration.GetValue<string?>("AnthropicModelId") ?? "claude-sonnet-4-6";

            return anthropicClient.AsIChatClient(modelId);
        });

        source.AddSingleton<IAiChatWorkoutPlanner, GenericAiChatWorkoutPlanner>();
        return source;
    }

    public static IServiceCollection AddRevenueCatPurchaseVerification(
        this IServiceCollection source
    )
    {
        source.AddSingleton<IRevenueCatPurchaseVerificationService>(services =>
        {
            var configuration = services.GetRequiredService<IConfiguration>();
            var accessTokenProvider = new AccessTokenProvider(
                configuration.GetValue<string>("RevenueCatApiKey")
                    ?? throw new Exception("RevenueCatApiKey not set")
            );
            var authProvider = new BaseBearerTokenAuthenticationProvider(accessTokenProvider);

            var adapter = new HttpClientRequestAdapter(authProvider);
            var revenueCatClient = new RevenueCatClient(adapter);
            var projectConfiguredRevenueCatApiClient = revenueCatClient.Projects[
                configuration.GetValue<string>("RevenueCatProjectId")
                    ?? throw new Exception("RevenueCatProjectId not set")
            ];
            var proEntitlementId =
                configuration.GetValue<string>("RevenueCatProEntitlementId")
                ?? throw new Exception("RevenueCatProEntitlementId not set");
            return new RevenueCatPurchaseVerificationService(
                projectConfiguredRevenueCatApiClient,
                proEntitlementId
            );
        });

        return source;
    }

    public static IServiceCollection AddWebAuthPurchaseVerification(this IServiceCollection source)
    {
        source.AddSingleton(
            (service) =>
            {
                var configuration = service.GetRequiredService<IConfiguration>();
                var webAuthKey = configuration.GetValue<string?>("WebAuthApiKey");
                return new WebAuthPurchaseVerificationService(webAuthKey);
            }
        );
        return source;
    }

    class AccessTokenProvider(string accessToken) : IAccessTokenProvider
    {
        public AllowedHostsValidator AllowedHostsValidator { get; } = new AllowedHostsValidator();

        public Task<string> GetAuthorizationTokenAsync(
            Uri uri,
            Dictionary<string, object>? additionalAuthenticationContext = null,
            CancellationToken cancellationToken = default
        )
        {
            return Task.FromResult(accessToken);
        }
    }
}
