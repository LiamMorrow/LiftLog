using OpenAI;
using LiftLog.Backend.Services;
using LiftLog.Lib.Models;
using LiftLog.Lib;

namespace LiftLog.Tests.Backend;

public class GptAiWorkoutPlannerTests
{
    [Fact]
    public async Task EnsureCanCallChatGpt()
    {

        var openAiClient = new OpenAIClient("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", OpenAIClientSettings.Default, new HttpClient());
        var gptAiWorkoutPlanner = new GptAiWorkoutPlanner(openAiClient);

        await gptAiWorkoutPlanner.GenerateWorkoutPlanAsync(
            new AiWorkoutAttributes(
                Gender.Male,
                "80-85",
                27,
                3,
                ImmutableListSequence.Of("Toning"),
                Experience.Intermediate));
    }
}
