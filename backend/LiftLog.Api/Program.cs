using System.Text.Json.Serialization;
using FluentValidation;
using LiftLog.Api.Authentication;
using LiftLog.Api.Db;
using LiftLog.Api.Features;
using LiftLog.Api.Hubs;
using LiftLog.Api.Service;
using LiftLog.Api.Service.Backup;
using LiftLog.Api.Validators;
using LiftLog.Lib.Serialization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddValidatorsFromAssemblyContaining<CreateUserRequestValidator>(
    ServiceLifetime.Singleton
);

// Add services to the container.

builder.Services.AddLiftLogDbContexts(builder.Configuration);
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("*").AllowAnyHeader().AllowAnyMethod();
    });
});

builder.Services.AddFeatureGating();

builder.Services.AddSignalR(s =>
{
    // We need clients to be able to stop in flight chat requests
    s.MaximumParallelInvocationsPerClient = 2;
    s.ClientTimeoutInterval = TimeSpan.FromSeconds(120);
    s.HandshakeTimeout = TimeSpan.FromSeconds(60);
});

builder
    .Services.AddAuthentication(PurchaseTokenAuthenticationSchemeOptions.SchemeName)
    .AddPurchaseToken()
    .AddApiKey()
    .AddForwardAuth();

builder.Services.AddAuthorization();

builder.Services.AddSingleton<PasswordService>();
builder.Services.AddScoped<RateLimitService>();

builder.Services.AddHostedService<CleanupExpiredDataHostedService>();
builder.Services.AddHostedService<ConfigurationLogger>();

builder.AddBackupSink();
builder.Services.AddAnthropicWorkoutPlanner();
builder.Services.AddAnthropicWorkoutPlannerV2();

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

MapAiChatHub<AiWorkoutChatHub>("/ai-chat");
MapAiChatHub<AiWorkoutChatHubV2>("/ai-chat-v2");

void MapAiChatHub<THub>(string path)
    where THub : Hub
{
    if (app.Services.GetRequiredService<IFeatureGate>().IsEnabled(Feature.AiPlanner))
    {
        app.MapHub<THub>(path);
        return;
    }

    var locked = () => Results.StatusCode(StatusCodes.Status423Locked);
    app.Map(path, locked);
    app.Map($"{path}/{{**rest}}", locked);
}

app.MapMethods(
    "/health",
    ["GET", "HEAD"],
    () =>
    {
        return "healthy";
    }
);

if (!app.Configuration.GetValue<bool>("SkipDatabaseMigrations"))
{
    using var scope = app.Services.CreateScope();
    var userDb = scope.ServiceProvider.GetRequiredService<UserDataContext>();
    await userDb.Database.MigrateAsync();
    var rateLimitDb = scope.ServiceProvider.GetRequiredService<RateLimitContext>();
    await rateLimitDb.Database.MigrateAsync();
}

app.Run();
