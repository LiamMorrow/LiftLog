namespace LiftLog.Api.Service;

extern alias OpenAICommunity;
using OpenAICommunity::OpenAI;
using LiftLog.Lib.Services;
using Microsoft.Extensions.DependencyInjection;
using Srcmkr.RevenueCat;

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

    public static IServiceCollection RegisterRevenueCat(
        this IServiceCollection source,
        IConfiguration configuration
    )
    {
        var revenueCatClient = RevenueCatClient.WithApiSecret(
            configuration.GetValue<string>("RevenueCatApiKey")
                ?? throw new Exception("RevenueCatApiKey not set")
        );
        source.AddSingleton(revenueCatClient);
        source.AddSingleton<RevenueCatPurchaseVerificationService>();
        return source;
    }
}
