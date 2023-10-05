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
    private readonly JsonNode aiWorkoutPlanJsonSchema = JsonNode.Parse(
        File.ReadAllText("./AiWorkoutPlan.json")
    )!;
    private readonly JsonNode sessionBlueprintJsonSchema = JsonNode.Parse(
        File.ReadAllText("./AiSessionBlueprint.json")
    )!;

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
            new Message(
                Role.User,
                $"""
            I am a {attributes.Age} year old {genderText} who weighs {attributes.WeightRange} kilograms. I would like to work on {goalsText}.
            I would like to work out {attributes.DaysPerWeek} days per week.
            My skill level with weight training is {attributes.Experience}.
            Please make me a workout plan.
            """
            ),
        };
        var chatRequest = new ChatRequest(
            messages,
            model: "gpt-3.5-turbo-0613",
            functionCall: "auto",
            functions: functions
        );
        var result = await openAiClient.ChatEndpoint.GetCompletionAsync(chatRequest);
        try
        {
            var gptPlan = JsonSerializer.Deserialize<GptWorkoutPlan>(
                result.FirstChoice.Message.Function.Arguments.ToString(),
                JsonSerializerSettings.LiftLog
            )!;

            return new AiWorkoutPlan(
                gptPlan.Description,
                gptPlan.Sessions
                    .Select(
                        s =>
                            new SessionBlueprint(
                                s.Name,
                                s.Exercises
                                    .Select(
                                        e =>
                                            new ExerciseBlueprint(
                                                e.Name,
                                                e.Sets,
                                                e.RepsPerSet,
                                                e.InitialKilograms,
                                                e.KilogramsIncreaseOnSuccess,
                                                new Rest(
                                                    TimeSpan.FromSeconds(
                                                        e.RestBetweenSets.MinRestSeconds
                                                    ),
                                                    TimeSpan.FromSeconds(
                                                        e.RestBetweenSets.MaxRestSeconds
                                                    ),
                                                    TimeSpan.FromSeconds(
                                                        e.RestBetweenSets.FailureRestSeconds
                                                    )
                                                ),
                                                false
                                            )
                                    )
                                    .ToImmutableList()
                            )
                    )
                    .ToImmutableList()
            );
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            Console.WriteLine(result.FirstChoice.Message.Function.Arguments.ToString());
            throw;
        }
    }

    public async Task<SessionBlueprint> GenerateSessionAsync(AiSessionAttributes attributes)
    {
        var areasToWorkout = string.Join(" and ", attributes.AreasToWorkout);
        var exerciseText = string.Join(
            "\n",
            attributes.ExerciseToKilograms.Select(pc => $"{pc.Key} at {pc.Value} kilograms")
        );

        var volumeText = attributes.Volume switch
        {
            < 25 => "two",
            < 50 => "three",
            < 75 => "five",
            < 90 => "seven",
            _ => "ten"
        };

        var functions = new List<Function>
        {
            new Function(
                "GetSession",
                "Gets a gym session based on the user's goals and attributes.",
                sessionBlueprintJsonSchema
            )
        };

        var messages = new List<Message>
        {
            new Message(
                Role.System,
                """
                You only cater to requests to create gym a gym session.
                The user may specify the exercises they have done before, and the weights they have used. Take this into account, but only use exercises which target the areas they want to work on.

                They may also specify how many exercises they want to do, and their goals for the session.
                """
            ),
            new Message(
                Role.User,
                $"""
            I'd like to workout today at the gym. The areas I'd like to work on {areasToWorkout}. I'd like it to have at lease {volumeText} exercises. Exercises I'm familiar with are as follows: {exerciseText}.
            Please suggest me a workout.
            """
            ),
        };
        var chatRequest = new ChatRequest(
            messages,
            model: "gpt-3.5-turbo-0613",
            functionCall: "auto",
            functions: functions
        );
        var result = await openAiClient.ChatEndpoint.GetCompletionAsync(chatRequest);
        try
        {
            var gptPlan = JsonSerializer.Deserialize<GptSessionBlueprint>(
                result.FirstChoice.Message.Function.Arguments.ToString(),
                JsonSerializerSettings.LiftLog
            )!;

            return new SessionBlueprint(
                gptPlan.Name,
                gptPlan.Exercises
                    .Select(
                        e =>
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
                                ),
                                false
                            )
                    )
                    .ToImmutableList()
            );
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
        ImmutableListValue<GptSessionBlueprint> Sessions
    );

    private record GptSessionBlueprint(
        string Name,
        ImmutableListValue<GptExerciseBlueprint> Exercises
    );

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
