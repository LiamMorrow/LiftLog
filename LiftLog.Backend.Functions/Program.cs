using Microsoft.Extensions.Hosting;
using LiftLog.Backend.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using LiftLog.Backend.Functions.Services;
using Azure.Data.Tables;
using Google.Apis.AndroidPublisher.v3;
using System.Security.Cryptography.X509Certificates;
using Google.Apis.Auth.OAuth2;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureServices(
        (context, services) =>
        {
            var openAiApiKey =
                context.Configuration.GetValue<string?>("OpenAiApiKey")
                ?? throw new Exception("OpenAiApiKey configuration is not set.");
            services.RegisterGptAiWorkoutPlanner(openAiApiKey);

            services.AddSingleton(
                new TableClient(
                    context.Configuration.GetValue<string>("LiftLogStorageConnectionString"),
                    "RateLimitByIp"
                )
            );

            services.AddHttpClient();
            services.AddSingleton<RateLimitService>();
            services.AddSingleton<PurchaseVerificationService>();
            services.AddSingleton<GooglePlayPurchaseVerificationService>();
            services.AddSingleton<AppleAppStorePurchaseVerificationService>();

            services.AddSingleton(
                (service) =>
                {
                    var webAuthKey = context.Configuration.GetValue<string?>("WebAuthApiKey");
                    return new WebAuthPurchaseVerificationService(webAuthKey);
                }
            );

            services.AddSingleton(
                (service) =>
                {
                    var certificateBase64 = context.Configuration.GetValue<string>(
                        "GooglePlayServiceAccountKeyBase64"
                    );
                    var serviceAccountEmail = context.Configuration.GetValue<string>(
                        "GooglePlayServiceAccountEmail"
                    );
                    var certificateBytes = Convert.FromBase64String(certificateBase64);
                    var certificate = new X509Certificate2(
                        certificateBytes,
                        "notasecret",
                        X509KeyStorageFlags.Exportable
                    );
                    ServiceAccountCredential credential =
                        new(
                            new ServiceAccountCredential.Initializer(serviceAccountEmail)
                            {
                                Scopes = new[] { AndroidPublisherService.Scope.Androidpublisher },
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
        }
    )
    .Build();

host.Run();
