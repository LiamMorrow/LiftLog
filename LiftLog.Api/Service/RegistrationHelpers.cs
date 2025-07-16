namespace LiftLog.Api.Service;

extern alias OpenAICommunity;
using OpenAICommunity::OpenAI;
using LiftLog.Lib.Services;
using Microsoft.Extensions.DependencyInjection;

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

        var openAiChatClient = new OpenAI.Chat.ChatClient("gpt-4.1", apiKey);
        source.AddSingleton<GptChatWorkoutPlanner>();
        source.AddSingleton(openAiChatClient);
        return source;
    }
}
