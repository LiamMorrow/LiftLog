namespace LiftLog.Api.Service;

extern alias OpenAICommunity;
using System.Collections.Generic;
using System.Security.Cryptography.X509Certificates;
using System.Threading;
using System.Threading.Tasks;
using OpenAICommunity::OpenAI;
using Google.Apis.AndroidPublisher.v3;
using Google.Apis.Auth.OAuth2;
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
            var openAiClient = new OpenAIClient(
                apiKey,
                OpenAIClientSettings.Default,
                new HttpClient()
            );
            return openAiClient;
        });

        source.AddSingleton<IAiWorkoutPlanner, GptAiWorkoutPlanner>();

        source.AddSingleton(services =>
        {
            var configuration = services.GetRequiredService<IConfiguration>();
            var apiKey =
                configuration.GetValue<string?>("OpenAiApiKey")
                ?? throw new Exception("OpenAiApiKey configuration is not set.");
            return new OpenAI.Chat.ChatClient("gpt-4.1", apiKey);
        });
        source.AddSingleton<GptChatWorkoutPlanner>();
        return source;
    }

    public static IServiceCollection AddApplePurchaseVerification(this IServiceCollection source)
    {
        source.AddHttpClient<AppleAppStorePurchaseVerificationService>();
        return source;
    }

    public static IServiceCollection AddGooglePurchaseVerification(this IServiceCollection source)
    {
        source.AddSingleton(
            (service) =>
            {
                var configuration = service.GetRequiredService<IConfiguration>();
                var certificateBase64 =
                    configuration.GetValue<string>("GooglePlayServiceAccountKeyBase64")
                    ?? throw new Exception(
                        "GooglePlayServiceAccountKeyBase64 configuration is not set."
                    );
                var serviceAccountEmail =
                    configuration.GetValue<string>("GooglePlayServiceAccountEmail")
                    ?? throw new Exception(
                        "GooglePlayServiceAccountEmail configuration is not set."
                    );
                var certificateBytes = Convert.FromBase64String(certificateBase64);
                var certificate = X509CertificateLoader.LoadPkcs12(
                    certificateBytes,
                    "notasecret",
                    X509KeyStorageFlags.Exportable
                );
                ServiceAccountCredential credential = new(
                    new ServiceAccountCredential.Initializer(serviceAccountEmail)
                    {
                        Scopes = [AndroidPublisherService.Scope.Androidpublisher],
                    }.FromCertificate(certificate)
                );
                return new AndroidPublisherService(
                    new AndroidPublisherService.Initializer
                    {
                        ApplicationName = "LiftLog",
                        HttpClientInitializer = credential,
                    }
                );
            }
        );
        source.AddSingleton<GooglePlayPurchaseVerificationService>();
        return source;
    }

    public static IServiceCollection AddRevenueCatPurchaseVerification(
        this IServiceCollection source
    )
    {
        source.AddSingleton<RevenueCatPurchaseVerificationService>(services =>
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
                proEntitlementId,
                services.GetRequiredService<ILogger<RevenueCatPurchaseVerificationService>>()
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
