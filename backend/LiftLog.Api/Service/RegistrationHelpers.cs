namespace LiftLog.Api.Service;

using System.Collections.Generic;
using System.Security.Cryptography.X509Certificates;
using System.Threading;
using System.Threading.Tasks;
using LiftLog.Lib.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Kiota.Abstractions.Authentication;
using Microsoft.Kiota.Http.HttpClientLibrary;
using RevenueCat.Client;

public static class RegistrationHelpers
{
    public static IServiceCollection AddGptAiWorkoutPlanner(this IServiceCollection source)
    {
        source.AddSingleton(services =>
        {
            var configuration = services.GetRequiredService<IConfiguration>();
            var apiKey =
                configuration.GetValue<string?>("OpenAiApiKey")
                ?? throw new Exception("OpenAiApiKey configuration is not set.");
            return new OpenAI.Chat.ChatClient("gpt-4.1", apiKey);
        });
        source.AddSingleton<IGptChatWorkoutPlanner, GptChatWorkoutPlanner>();
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
