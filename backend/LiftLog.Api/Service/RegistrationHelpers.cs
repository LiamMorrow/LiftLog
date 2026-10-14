namespace LiftLog.Api.Service;

using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Anthropic;
using LiftLog.Api.Authentication;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Kiota.Abstractions.Authentication;
using Microsoft.Kiota.Http.HttpClientLibrary;
using RevenueCat.Client;

public static class AiPlannerConfiguration
{
    public const string SectionName = "AiPlanner";
    public const string AnthropicApiKeyPath = $"{SectionName}:AnthropicApiKey";
    public const string AnthropicModelIdPath = $"{SectionName}:AnthropicModelId";
}

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
                configuration.GetValue<string?>(AiPlannerConfiguration.AnthropicApiKeyPath)
                ?? throw new Exception(
                    $"'{AiPlannerConfiguration.AnthropicApiKeyPath}' is not configured."
                );

            var anthropicClient = new AnthropicClient { ApiKey = apiKey };

            // Use claude-sonnet-4-6 as a good balance of capability and cost
            // Can be configured via configuration if needed
            var modelId =
                configuration.GetValue<string?>(AiPlannerConfiguration.AnthropicModelIdPath)
                ?? "claude-sonnet-4-6";

            return anthropicClient.AsIChatClient(modelId);
        });

        source.AddSingleton<IAiChatDirectory, AiChatDirectory>();
        return source;
    }

    /// <summary>
    /// Registers the AI Workout Planner that talks to the Anthropic SDK directly
    /// (for fine-grained streaming) and drives tool use from the generated AiPlan
    /// schema.
    /// </summary>
    public static IServiceCollection AddAnthropicWorkoutPlannerV2(this IServiceCollection source)
    {
        source.AddSingleton<AnthropicClient>(services =>
        {
            var configuration = services.GetRequiredService<IConfiguration>();
            var apiKey =
                configuration.GetValue<string?>(AiPlannerConfiguration.AnthropicApiKeyPath)
                ?? throw new Exception(
                    $"'{AiPlannerConfiguration.AnthropicApiKeyPath}' is not configured."
                );
            return new AnthropicClient { ApiKey = apiKey };
        });

        source.AddSingleton<IAnthropicMessageStreamer, AnthropicMessageStreamer>();
        source.AddSingleton<AiPlanToolProvider>();
        source.AddSingleton<IAiChatDirectoryV2, AiChatDirectoryV2>();
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
                configuration.GetValue<string>(AuthConfiguration.PurchaseToken.RevenueCatApiKeyPath)
                    ?? throw new Exception(
                        $"'{AuthConfiguration.PurchaseToken.RevenueCatApiKeyPath}' is not configured."
                    )
            );
            var authProvider = new BaseBearerTokenAuthenticationProvider(accessTokenProvider);

            var adapter = new HttpClientRequestAdapter(authProvider);
            var revenueCatClient = new RevenueCatClient(adapter);
            var projectConfiguredRevenueCatApiClient = revenueCatClient.Projects[
                configuration.GetValue<string>(
                    AuthConfiguration.PurchaseToken.RevenueCatProjectIdPath
                )
                    ?? throw new Exception(
                        $"'{AuthConfiguration.PurchaseToken.RevenueCatProjectIdPath}' is not configured."
                    )
            ];
            var proEntitlementId =
                configuration.GetValue<string>(
                    AuthConfiguration.PurchaseToken.RevenueCatProEntitlementIdPath
                )
                ?? throw new Exception(
                    $"'{AuthConfiguration.PurchaseToken.RevenueCatProEntitlementIdPath}' is not configured."
                );
            return new RevenueCatPurchaseVerificationService(
                projectConfiguredRevenueCatApiClient,
                proEntitlementId
            );
        });

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
