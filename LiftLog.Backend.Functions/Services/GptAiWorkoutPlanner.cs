namespace LiftLog.Backend.Services;

using System.Collections.Immutable;
using System.Security.Cryptography.X509Certificates;
using System.Text.Json;
using System.Text.Json.Nodes;
using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Lib.Serialization;
using LiftLog.Lib.Services;
using OpenAI;
using OpenAI.Chat;

public class GptAiWorkoutPlanner : IAiWorkoutPlanner
{
    private readonly OpenAIClient openAiClient;
    private readonly JsonNode aiWorkoutPlanJsonSchema = JsonNode.Parse(File.ReadAllText("./AiWorkoutPlan.json"))!;

    public GptAiWorkoutPlanner(OpenAIClient openAiClient)
    {
        this.openAiClient = openAiClient;
    }
    public async Task<AiWorkoutPlan> GenerateWorkoutPlanAsync(AiWorkoutAttributes attributes)
    {

        var genderText = attributes.Gender switch
        {
            Gender.Male => " male",
            Gender.Female => " female",
            Gender.Other => " with a gender other than male or female",
            Gender.PreferNotToSay => "",
            _ => ""
        };

        var goalsText = string.Join(" and ", attributes.Goals);
        using var file = File.OpenRead("./AiWorkoutPlan.json");

        var functions = new List<Function>
        {
            new Function(
                "GetGymPlan",
                "Gets a gym plan based on the user's goals and attributes.",
                aiWorkoutPlanJsonSchema
            )
        };

        var messages = new List<Message>
        {
            new Message(Role.System, "You only cater to requests to create gym plans."),
            new Message(Role.User, $"""
            I am a {attributes.Age} year old {genderText} who weighs {attributes.WeightRange} kilograms. I would like to work on {goalsText}.
            I would like to work out {attributes.DaysPerWeek} days per week.
            My skill level with weight training is {attributes.Experience}.
            Please make me a workout plan.
            """),
        };
        var chatRequest = new ChatRequest(messages, model: "gpt-3.5-turbo-0613", functionCall: "auto", functions: functions);
        var result = await openAiClient.ChatEndpoint.GetCompletionAsync(chatRequest);
        try
        {
            var gptPlan = JsonSerializer.Deserialize<GptWorkoutPlan>(result.FirstChoice.Message.Function.Arguments.ToString(), JsonSerializerSettings.LiftLog)!;

            return new AiWorkoutPlan(
                gptPlan.Description,
                gptPlan.Sessions.Select(s =>
                    new SessionBlueprint(
                        s.Name,
                        s.Exercises.Select(e =>
                            new ExerciseBlueprint(
                                e.Name,
                                e.Sets,
                                e.RepsPerSet,
                                e.InitialKilograms,
                                e.KilogramsIncreaseOnSuccess,
                                new Rest(
                                    TimeSpan.FromSeconds(e.RestBetweenSets.MinRestSeconds),
                                    TimeSpan.FromSeconds(e.RestBetweenSets.MaxRestSeconds),
                                    TimeSpan.FromSeconds(e.RestBetweenSets.FailureRestSeconds)
                                )
                            )
                        ).ToImmutableList()
                    )
                ).ToImmutableList());

        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            Console.WriteLine(result.FirstChoice.Message.Function.Arguments.ToString());
            throw;
        }
    }

    private record GptWorkoutPlan(
        string Description,
        ImmutableListSequence<GptSessionBlueprint> Sessions
    );


    private record GptSessionBlueprint(string Name, ImmutableListSequence<GptExerciseBlueprint> Exercises);

    private record GptExerciseBlueprint(
        string Name,
        int Sets,
        int RepsPerSet,
        decimal InitialKilograms,
        decimal KilogramsIncreaseOnSuccess,
        GptRest RestBetweenSets
    );

    private record GptRest(int MinRestSeconds, int MaxRestSeconds, int FailureRestSeconds);

}
