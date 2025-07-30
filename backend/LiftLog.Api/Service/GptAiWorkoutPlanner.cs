namespace LiftLog.Api.Service;

extern alias OpenAICommunity;

using System.Collections.Immutable;
using System.Text.Json;
using System.Text.Json.Nodes;

using OpenAICommunity::OpenAI;
using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Lib.Serialization;
using LiftLog.Lib.Services;
using OpenAICommunity::OpenAI.Chat;

public class GptAiWorkoutPlanner(OpenAIClient openAiClient, ILogger<GptAiWorkoutPlanner> logger)
    : IAiWorkoutPlanner
{
    private static readonly JsonNode aiWorkoutPlanJsonSchema = JsonNode.Parse(
        File.ReadAllText("./AiWorkoutPlan.json")
    )!;
    private static readonly Function GetGymPlanFunction = new(
        "GetGymPlan",
        "Gets a gym plan based on the user's goals and attributes.",
        aiWorkoutPlanJsonSchema
    );

    private static readonly JsonNode sessionBlueprintJsonSchema = JsonNode.Parse(
        File.ReadAllText("./AiSessionBlueprint.json")
    )!;
    private static readonly Function GetSessionFunction = new(
        "GetSession",
        "Gets a gym session based on the user's goals and attributes.",
        sessionBlueprintJsonSchema
    );

    public async Task<AiWorkoutPlan> GenerateWorkoutPlanAsync(AiWorkoutAttributes attributes)
    {
        var genderText = attributes.Gender switch
        {
            Gender.Male => " male",
            Gender.Female => " female",
            Gender.Other => " with a gender other than male or female",
            Gender.PreferNotToSay => "",
            _ => "",
        };

        var goalsText = string.Join(" and ", attributes.Goals);

        var tools = new List<Tool> { GetGymPlanFunction };

        string? AdditionalInfo()
        {
            if (attributes.AdditionalInfo is null)
                return null;
            return $"Additionally, I have the following information: {attributes.AdditionalInfo}";
        }

        var messages = new List<Message>
        {
            new(Role.System, "You only cater to requests to create gym plans."),
            new(
                Role.User,
                $"""
                 I am a {attributes.Age} year old {genderText} who weighs {attributes.WeightRange} {(
                    attributes.UseImperialUnits ? "pounds" : "kilograms"
                )}. I would like to work on {goalsText}.
                 I would like to work out {attributes.DaysPerWeek} days per week.
                 My skill level with weight training is {attributes.Experience}.
                 {AdditionalInfo()}
                 Please make me a workout plan.
                 """
            ),
        };
        var chatRequest = new ChatRequest(
            messages,
            model: OpenAICommunity::OpenAI.Models.Model.GPT4o,
            toolChoice: "auto",
            tools: tools
        );
        var result = await openAiClient.ChatEndpoint.GetCompletionAsync(chatRequest);
        try
        {
            var gptPlan = JsonSerializer.Deserialize<GptWorkoutPlan>(
                result.FirstChoice.Message.ToolCalls.First().Function.Arguments.ToString(),
                JsonSerializerSettings.LiftLog
            )!;

            return new AiWorkoutPlan(
                gptPlan.Name,
                gptPlan.Description,
                gptPlan
                    .Sessions.Select(s => new SessionBlueprint(
                        s.Name,
                        s.Exercises.Select(e => new ExerciseBlueprint(
                                e.Name,
                                e.Sets,
                                e.RepsPerSet,
                                e.WeightIncreaseOnSuccess,
                                new Rest(
                                    TimeSpan.FromSeconds(e.RestBetweenSets.MinRestSeconds),
                                    TimeSpan.FromSeconds(e.RestBetweenSets.MaxRestSeconds),
                                    TimeSpan.FromSeconds(e.RestBetweenSets.FailureRestSeconds)
                                ),
                                false,
                                Notes: "",
                                Link: ""
                            ))
                            .ToImmutableList(),
                        Notes: s.Description
                    ))
                    .ToImmutableList()
            );
        }
        catch (Exception e)
        {
            logger.LogError(e, "Error generating workout plan");
            logger.LogWarning("{Msg}", result.FirstChoice.Message);
            throw;
        }
    }

    public async Task<SessionBlueprint> GenerateSessionAsync(AiSessionAttributes attributes)
    {
        var areasToWorkout = string.Join(" and ", attributes.AreasToWorkout);
        var exerciseText = string.Join(
            "\n",
            attributes.ExerciseToWeight.Select(pc =>
                $"{pc.Key} at {pc.Value} {(attributes.UseImperialUnits ? "pounds" : "kilograms")}"
            )
        );

        var volumeText = attributes.Volume switch
        {
            < 25 => "two",
            < 50 => "three",
            < 75 => "five",
            < 90 => "seven",
            _ => "ten",
        };

        var tools = new List<Tool> { GetSessionFunction };
        string? AdditionalInfo()
        {
            if (attributes.AdditionalInfo is null)
                return null;
            return $"Additionally, I have the following information: {attributes.AdditionalInfo}";
        }

        var messages = new List<Message>
        {
            new(
                Role.System,
                """
                You only cater to requests to create gym a gym session.
                The user may specify the exercises they have done before, and the weights they have used. Take this into account, but only use exercises which target the areas they want to work on.

                They may also specify how many exercises they want to do, and their goals for the session.
                """
            ),
            new(
                Role.User,
                $"""
                I'd like to workout today at the gym. The areas I'd like to work on {areasToWorkout}. I'd like it to have at lease {volumeText} exercises. Exercises I'm familiar with are as follows: {exerciseText}.
                {AdditionalInfo()}
                Please suggest me a workout.
                """
            ),
        };
        var chatRequest = new ChatRequest(
            messages,
            model: OpenAICommunity::OpenAI.Models.Model.GPT4o,
            toolChoice: "auto",
            tools: tools
        );
        var result = await openAiClient.ChatEndpoint.GetCompletionAsync(chatRequest);
        try
        {
            var gptPlan = JsonSerializer.Deserialize<GptSessionBlueprint>(
                result.FirstChoice.Message.ToolCalls.First().Function.Arguments.ToString(),
                JsonSerializerSettings.LiftLog
            )!;

            return new SessionBlueprint(
                gptPlan.Name,
                gptPlan
                    .Exercises.Select(e => new ExerciseBlueprint(
                        e.Name,
                        e.Sets,
                        e.RepsPerSet,
                        e.WeightIncreaseOnSuccess,
                        new Rest(
                            TimeSpan.FromSeconds(e.RestBetweenSets.MinRestSeconds),
                            TimeSpan.FromSeconds(e.RestBetweenSets.MaxRestSeconds),
                            TimeSpan.FromSeconds(e.RestBetweenSets.FailureRestSeconds)
                        ),
                        false,
                        Notes: "",
                        Link: ""
                    ))
                    .ToImmutableList(),
                Notes: gptPlan.Description
            );
        }
        catch (Exception e)
        {
            logger.LogError(e, "Error generating workout session");
            logger.LogWarning("{Msg}", result.FirstChoice.Message);
            throw;
        }
    }

    private record GptWorkoutPlan(
        string Name,
        string Description,
        ImmutableListValue<GptSessionBlueprint> Sessions
    );

    private record GptSessionBlueprint(
        string Name,
        ImmutableListValue<GptExerciseBlueprint> Exercises,
        string Description
    );

    private record GptExerciseBlueprint(
        string Name,
        int Sets,
        int RepsPerSet,
        decimal WeightIncreaseOnSuccess,
        GptRest RestBetweenSets,
        string Notes
    );

    private record GptRest(int MinRestSeconds, int MaxRestSeconds, int FailureRestSeconds);
}
