namespace LiftLog.Backend.Service;

using LiftLog.Lib.Services;
using Microsoft.Extensions.DependencyInjection;
using OpenAI;

public static class RegistrationHelpers
{
    public static IServiceCollection RegisterGptAiWorkoutPlanner(
        this IServiceCollection source,
        string apiKey
    )
    {
        var openAiClient = new OpenAIClient(apiKey, OpenAIClientSettings.Default, new HttpClient());
        source.AddSingleton(openAiClient);
        source.AddSingleton<IAiWorkoutPlanner, GptAiWorkoutPlanner>();
        return source;
    }
}
