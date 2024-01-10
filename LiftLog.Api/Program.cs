using System.Security.Cryptography.X509Certificates;
using System.Text.Json.Serialization;
using FluentValidation;
using Google.Apis.AndroidPublisher.v3;
using Google.Apis.Auth.OAuth2;
using LiftLog.Api.Db;
using LiftLog.Api.Service;
using LiftLog.Api.Validators;
using LiftLog.Lib.Serialization;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddValidatorsFromAssemblyContaining<CreateUserRequestValidator>(
    ServiceLifetime.Singleton
);

// Add services to the container.

builder.Services.AddDbContext<UserDataContext>(
    options => options.UseNpgsql(builder.Configuration.GetConnectionString("UserDataContext"))
);
builder.Services.AddDbContext<RateLimitContext>(
    options => options.UseNpgsql(builder.Configuration.GetConnectionString("RateLimitContext"))
);
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("*").AllowAnyHeader().AllowAnyMethod();
    });
});

var openAiApiKey =
    builder.Configuration.GetValue<string?>("OpenAiApiKey")
    ?? throw new Exception("OpenAiApiKey configuration is not set.");
builder.Services.RegisterGptAiWorkoutPlanner(openAiApiKey);

builder.Services.AddSingleton<PasswordService>();
builder.Services.AddHttpClient<AppleAppStorePurchaseVerificationService>();
builder.Services.AddScoped<RateLimitService>();
builder.Services.AddScoped<PurchaseVerificationService>();
builder.Services.AddScoped<GooglePlayPurchaseVerificationService>();

builder.Services.AddScoped(
    (service) =>
    {
        var webAuthKey = builder.Configuration.GetValue<string?>("WebAuthApiKey");
        return new WebAuthPurchaseVerificationService(webAuthKey);
    }
);

builder.Services.AddSingleton(
    (service) =>
    {
        var certificateBase64 =
            builder.Configuration.GetValue<string>("GooglePlayServiceAccountKeyBase64")
            ?? throw new Exception("GooglePlayServiceAccountKeyBase64 configuration is not set.");
        var serviceAccountEmail =
            builder.Configuration.GetValue<string>("GooglePlayServiceAccountEmail")
            ?? throw new Exception("GooglePlayServiceAccountEmail configuration is not set.");
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

builder
    .Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.AllowTrailingCommas = true;
        opts.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        opts.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        opts.JsonSerializerOptions.Converters.Add(new TimespanJsonConverter());
        opts.JsonSerializerOptions.Converters.Add(new ImmutableDictionaryJsonConverter());
    });

var app = builder.Build();

app.UseCors();

app.UseHttpsRedirection();

app.MapControllers();

app.MapGet(
    "/health",
    () =>
    {
        return "healthy";
    }
);

using (var scope = app.Services.CreateScope())
{
    var userDb = scope.ServiceProvider.GetRequiredService<UserDataContext>();
    await userDb.Database.MigrateAsync();
    var rateLimitDb = scope.ServiceProvider.GetRequiredService<RateLimitContext>();
    await rateLimitDb.Database.MigrateAsync();
}

app.Run();
