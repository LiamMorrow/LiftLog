using System.Text.Json.Serialization;
using FluentValidation;
using LiftLog.Api.Authentication;
using LiftLog.Api.Db;
using LiftLog.Api.Hubs;
using LiftLog.Api.Service;
using LiftLog.Api.Validators;
using LiftLog.Lib.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Migrations;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddValidatorsFromAssemblyContaining<CreateUserRequestValidator>(
    ServiceLifetime.Singleton
);

// Add services to the container.

builder.Services.AddDbContext<UserDataContext>(options =>
    options
        .UseNpgsql(builder.Configuration.GetConnectionString("UserDataContext"))
        .ReplaceService<IHistoryRepository, CamelCaseHistoryContext>()
        .UseSnakeCaseNamingConvention()
);
builder.Services.AddDbContext<RateLimitContext>(options =>
    options
        .UseNpgsql(builder.Configuration.GetConnectionString("RateLimitContext"))
        .ReplaceService<IHistoryRepository, CamelCaseHistoryContext>()
        .UseSnakeCaseNamingConvention()
);
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("*").AllowAnyHeader().AllowAnyMethod();
    });
});

builder.Services.AddSignalR(s =>
{
    // We need clients to be able to stop in flight chat requests
    s.MaximumParallelInvocationsPerClient = 2;
    s.ClientTimeoutInterval = TimeSpan.FromSeconds(120);
    s.HandshakeTimeout = TimeSpan.FromSeconds(60);
});

// Add Authentication
builder
    .Services.AddAuthentication(PurchaseTokenAuthenticationSchemeOptions.SchemeName)
    .AddScheme<PurchaseTokenAuthenticationSchemeOptions, PurchaseTokenAuthenticationHandler>(
        PurchaseTokenAuthenticationSchemeOptions.SchemeName,
        options => { }
    );

builder.Services.AddAuthorization();

builder.Services.AddSingleton<PasswordService>();
builder.Services.AddScoped<RateLimitService>();

builder.Services.AddHostedService<CleanupExpiredDataHostedService>();

builder.Services.AddScoped<PurchaseVerificationService>();
builder.Services.AddGooglePurchaseVerification();
builder.Services.AddApplePurchaseVerification();
builder.Services.AddGptAiWorkoutPlanner();
builder.Services.AddWebAuthPurchaseVerification();
builder.Services.AddRevenueCatPurchaseVerification();

builder
    .Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.AllowTrailingCommas = true;
        opts.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        opts.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        opts.JsonSerializerOptions.Converters.Add(new TimeSpanJsonConverter());
        opts.JsonSerializerOptions.Converters.Add(new ImmutableDictionaryJsonConverter());
    });

var app = builder.Build();
app.UseCors();

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Map SignalR Hubs
app.MapHub<AiWorkoutChatHub>("/ai-chat");

app.MapMethods(
    "/health",
    ["GET", "HEAD"],
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

public partial class Program { }
