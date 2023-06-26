using Microsoft.Extensions.Hosting;
using LiftLog.Backend.Services;
using Microsoft.Extensions.Configuration;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureServices((context, services) =>
    {
        var openAiApiKey = context.Configuration.GetValue<string?>("OpenAiApiKey")
            ?? throw new Exception("OpenAiApiKey configuration is not set.");
        services.RegisterGptAiWorkoutPlanner(openAiApiKey);
    })
    .Build();

host.Run();
