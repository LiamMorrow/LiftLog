namespace LiftLog.Backend.Services;
using System.Text.Json;
using System.Text.Json.Nodes;
using LiftLog.Lib.Models;
using LiftLog.Lib.Serialization;
using OpenAI;
using OpenAI.Chat;

public class GptAiWorkoutPlanner : IAiWorkoutPlanner
{
    private readonly OpenAIClient openAiClient;

    public GptAiWorkoutPlanner(OpenAIClient openAiClient)
    {
        this.openAiClient = openAiClient;
    }
    public async Task<AiWorkoutPlan> GenerateWorkoutPlanAsync(AiWorkoutAttributes attributes)
    {
        var jsonSerializerOptions = new JsonSerializerOptions(JsonSerializerOptions.Default);
        jsonSerializerOptions.Converters.Add(new TimespanJsonConverter());

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
            new JsonObject
            {
                ["type"] = "object",
                ["description"] = "An object containing a description of the plan, with recommendations for their skill level and goals. Should give guidance related to their skill level, age weight, and potential nutrients.  Should also say whether this plan will be suitable for them, and if not, why not.",
                ["required"]= new JsonArray{"Description", "Sessions"},
                ["properties"] = new JsonObject
                {
                    ["Description"] = new JsonObject
                    {
                        ["type"] = "string",
                        ["description"] = "A description of the plan, with recommendations for their skill level and goals."
                    },
                    ["Sessions"] = new JsonObject
                    {
                        ["type"] = "array",
                        ["description"] = "An array of sessions to perform.",
                        ["items"] = new JsonObject
                        {
                            ["type"] = "object",
                            ["description"] = "A session to perform.",
                            ["required"]= new JsonArray{"Name", "Exercises"},
                            ["properties"] = new JsonObject
                            {
                                ["Name"] = new JsonObject
                                {
                                    ["type"] = "string",
                                    ["description"] = "The name of the session.  This might relate to the day of the week, or the type of session (e.g. 'Legs')."
                                },
                                ["Exercises"] = new JsonObject
                                {
                                    ["type"] = "array",
                                    ["description"] = "An array of exercises to perform.",
                                    ["items"] = new JsonObject
                                    {
                                        ["type"] = "object",
                                        ["description"] = "An exercise to perform.",
                                        ["required"]= new JsonArray{"Name", "Sets", "RepsPerSet", "InitialKilograms", "KilogramsIncreaseOnSuccess", "Rest"},
                                        ["properties"] = new JsonObject
                                        {
                                            ["Name"] = new JsonObject
                                            {
                                                ["type"] = "string",
                                                ["description"] = "The name of the exercise."
                                            },
                                            ["Sets"] = new JsonObject
                                            {
                                                ["type"] = "integer",
                                                ["description"] = "The number of sets to perform."
                                            },
                                            ["RepsPerSet"] = new JsonObject
                                            {
                                                ["type"] = "integer",
                                                ["description"] = "The number of reps to perform.  If the exercise is timed, this is the number of seconds to perform the exercise for."
                                            },
                                            ["InitialKilograms"] = new JsonObject
                                            {
                                                ["type"] = "number",
                                                ["description"] = "The initial weight to use for the exercise when first performing it. If it is bodyweight, set to 0."
                                            },
                                            ["KilogramsIncreaseOnSuccess"] = new JsonObject
                                            {
                                                ["type"] = "number",
                                                ["description"] = "The amount of weight to increase by on successful completion of all reps in the set.  If the exercise is timed, this is the number of seconds to increase by on successful completion of all reps in the set."
                                            },
                                            ["RestBetweenSets"] = new JsonObject
                                            {
                                                ["type"] = "object",
                                                ["description"] = "The rest time to use for the exercise.",
                                                ["required"]= new JsonArray{"MinRest","SecondaryRest", "FailureRest"},
                                                ["properties"] = new JsonObject
                                                {
                                                    ["MinRest"] = new JsonObject
                                                    {
                                                        ["type"] = "string",
                                                        ["description"] = "The minimum rest time to use for the exercise on successful completion of all reps. It must be expressed ISO-8601 format"
                                                    },
                                                    ["SecondaryRest"] = new JsonObject
                                                    {
                                                        ["type"] = "string",
                                                        ["description"] = "The maximum rest time to use for the exercise on successful completion of all reps. It must be expressed ISO-8601 format"
                                                    },
                                                    ["FailureRest"] = new JsonObject
                                                    {
                                                        ["type"] = "string",
                                                        ["description"] = "The rest time to use for the exercise on failure to complete all reps in the set. It must be expressed ISO-8601 format"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
            })
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
            return JsonSerializer.Deserialize<AiWorkoutPlan>(result.FirstChoice.Message.Function.Arguments.ToString(), jsonSerializerOptions)!;
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            Console.WriteLine(result.FirstChoice.Message.Function.Arguments.ToString());
            throw;
        }
    }
}
