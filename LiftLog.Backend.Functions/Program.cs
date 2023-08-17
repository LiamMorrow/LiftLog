using Microsoft.Extensions.Hosting;
using LiftLog.Backend.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using LiftLog.Backend.Functions.Services;
using Azure.Data.Tables;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureServices((context, services) =>
    {
        var openAiApiKey = context.Configuration.GetValue<string?>("OpenAiApiKey")
            ?? throw new Exception("OpenAiApiKey configuration is not set.");
        services.RegisterGptAiWorkoutPlanner(openAiApiKey);

        services.AddSingleton(new TableClient(
            context.Configuration.GetValue<string>("LiftLogStorageConnectionString"),
            "RateLimitByIp"
        ));
        services.AddSingleton<RateLimitService>();
    })
    .Build();

host.Run();
