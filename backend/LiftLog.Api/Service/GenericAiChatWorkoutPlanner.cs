using System.Collections.Concurrent;
using System.Collections.Immutable;
using System.ComponentModel;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using LiftLog.Api.Models;
using LiftLog.Lib.Models;
using Microsoft.Extensions.AI;

namespace LiftLog.Api.Service;

/// <summary>
/// AI Chat Workout Planner using Microsoft.Extensions.AI abstractions.
/// This is provider-agnostic and works with any IChatClient implementation
/// (Anthropic, Ollama, etc.)
/// </summary>
public partial class GenericAiChatWorkoutPlanner(
    IChatClient _chatClient,
    ILogger<GenericAiChatWorkoutPlanner> _logger
) : IAiChatWorkoutPlanner
{
    private const string SystemMessage = """
        You only cater to requests to create gym plans. If a user asks for a plan, just make one. Don't ask them any more questions.
        DO NOT get sidetracked by nutrition or weird questions. You just create workouts, possibly entire plans for weekly sessions.
        The user may not be speaking english, respond in the language they are speaking or the language they ask you to respond in.
        A workout can consist of exercises which are an amount of reps for an amount of sets. Prefer shorter responses.
        When you have gathered enough information to create a workout plan, use the create_workout_plan tool to generate and return the plan.
        It is okay to ask for clarification or more info, but when you are ready to make a plan, respond with the create_workout_plan tool.
        The user will typically ask you to introduce yourself, you may do so.
        """;

    private static readonly ChatMessage systemChatMessage = new ChatMessage(
        ChatRole.System,
        SystemMessage
    );

    // Store conversations per connection ID
    private List<ChatMessage> messages = [systemChatMessage];

    // Checked during an inflight chat, if present, will stop generating
    private CancellationTokenSource? chatStopToken = null;

    // Store the latest plan response per connection (used for tool call results)
    private AiChatPlanResponse? pendingPlanResponse = null;

    /// <summary>
    /// Tool function that creates a workout plan. This is called by the AI via function calling.
    /// </summary>
    [Description(
        "Creates and returns a workout plan to the user. Use this when you have enough information to generate a plan."
    )]
    private AiChatPlanResponse CreateWorkoutPlan(
        [Description("A short name for the workout plan")] string name,
        [Description("A description of the plan, with recommendations for skill level and goals")]
            string description,
        [Description("The workout sessions that make up the plan")] WorkoutSession[] sessions
    )
    {
        var plan = new AiWorkoutPlan(
            name,
            description,
            sessions
                .Select(s => new SessionBlueprint(
                    s.Name,
                    s.Exercises.Select(e => new ExerciseBlueprint(
                            e.Name,
                            e.Sets,
                            e.RepsPerSet,
                            e.WeightIncreaseOnSuccess,
                            new Rest(
                                TimeSpan.FromSeconds(e.MinRestSeconds),
                                TimeSpan.FromSeconds(e.MaxRestSeconds),
                                TimeSpan.FromSeconds(e.FailureRestSeconds)
                            ),
                            SupersetWithNext: false,
                            Notes: e.Notes ?? "",
                            Link: ""
                        ))
                        .ToImmutableList(),
                    Notes: s.Description ?? ""
                ))
                .ToImmutableList()
        );

        return new AiChatPlanResponse(plan);
    }

    public async Task Introduce(string locale, Func<AiChatResponse, Task> callback)
    {
        if (!LocaleRegex().IsMatch(locale))
        {
            locale = "en-AU";
        }
        messages.Add(
            new ChatMessage(
                ChatRole.User,
                $"Hi there, can you introduce yourself? Please respond in my locale of {locale}"
            )
        );

        await GetResponseToCurrentMessagesAsync(callback);
    }

    public async Task SendMessageAsync(string userMessage, Func<AiChatResponse, Task> callback)
    {
        messages.Add(new ChatMessage(ChatRole.User, userMessage));
        await GetResponseToCurrentMessagesAsync(callback);
    }

    private async Task GetResponseToCurrentMessagesAsync(Func<AiChatResponse, Task> callback)
    {
        try
        {
            var cancellationToken = new CancellationTokenSource();
            chatStopToken = cancellationToken;
            pendingPlanResponse = null;

            // Create the workout plan tool
            var workoutPlanTool = AIFunctionFactory.Create(
                CreateWorkoutPlan,
                new AIFunctionFactoryOptions { Name = "create_workout_plan" }
            );

            var chatOptions = new ChatOptions
            {
                Tools = [workoutPlanTool],
                MaxOutputTokens = 100_000,
            };

            var responseText = "";
            var updates = new List<ChatResponseUpdate>();
            await foreach (
                var update in _chatClient
                    .GetStreamingResponseAsync(messages, chatOptions, cancellationToken.Token)
                    .WithCancellation(cancellationToken.Token)
            )
            {
                updates.Add(update);

                // Stream text content to callback
                if (update.Text != "")
                {
                    responseText += update.Text;
                    await callback(new AiChatMessageResponse(responseText));
                }
            }

            if (cancellationToken.IsCancellationRequested)
            {
                return;
            }

            // Build the response and add to history
            var response = updates.ToChatResponse();
            var nonCachedInput =
                (response.Usage?.InputTokenCount ?? 0)
                - (response.Usage?.CachedInputTokenCount ?? 0);
            var cachedInput = response.Usage?.CachedInputTokenCount ?? 0;
            var outputTokens = response.Usage?.OutputTokenCount ?? 0;
            var estimatedCostUsd =
                nonCachedInput * 3.0 / 1_000_000
                + cachedInput * 0.3 / 1_000_000
                + outputTokens * 15.0 / 1_000_000;
            _logger.LogInformation(
                "Completion finished. Usage: Total:{Total} [Input:{Input} (Cached:{Cached}) Output:{Output}] EstimatedCost:${Cost:F6}",
                response.Usage?.TotalTokenCount,
                response.Usage?.InputTokenCount,
                response.Usage?.CachedInputTokenCount,
                response.Usage?.OutputTokenCount,
                estimatedCostUsd
            );
            // Add assistant message (including any tool_use blocks) before tool results
            messages.AddMessages(response);

            // Process function calls after the assistant message is in history so that
            // tool_result blocks always follow their corresponding tool_use block
            foreach (var message in response.Messages)
            {
                foreach (var content in message.Contents)
                {
                    if (content is FunctionCallContent functionCall)
                    {
                        await ProcessFunctionCallAsync(functionCall, callback, workoutPlanTool);
                    }
                }
            }

            if (pendingPlanResponse != null)
            {
                pendingPlanResponse = null;
            }

            // Keep conversation history manageable (last 20 messages)
            if (messages.Count > 21) // System message + 20 conversation messages
            {
                var recentMessages = messages[2..];
                messages.Clear();
                messages.Add(systemChatMessage);
                messages.AddRange(recentMessages);
            }
        }
        catch (OperationCanceledException)
        {
            return;
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error in chat conversation");
            throw;
        }
    }

    private async Task ProcessFunctionCallAsync(
        FunctionCallContent functionCall,
        Func<AiChatResponse, Task> callback,
        AIFunction workoutPlanTool
    )
    {
        if (functionCall.Name == "create_workout_plan" && functionCall.Arguments != null)
        {
            try
            {
                // Extract arguments and invoke the tool
                var arguments = new AIFunctionArguments(functionCall.Arguments);
                var result = await workoutPlanTool.InvokeAsync(arguments);
                var jsonResult = (JsonElement)result!;
                var deserialized = JsonSerializer.Deserialize<AiChatPlanResponse>(
                    jsonResult,
                    JsonSerializerOptions.Web
                );

                if (deserialized != null)
                {
                    pendingPlanResponse = deserialized;
                    await callback(deserialized);

                    // Add the function call result to the conversation including the plan so
                    // the AI can iterate on it if the user asks for changes
                    messages.Add(
                        new ChatMessage(
                            ChatRole.Tool,
                            [
                                new FunctionResultContent(
                                    functionCall.CallId,
                                    $"Plan created and sent to user successfully. Plan: {jsonResult}"
                                ),
                            ]
                        )
                    );
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error invoking workout plan tool");
            }
        }
    }

    public Task ClearConversationAsync()
    {
        messages = [new ChatMessage(ChatRole.System, SystemMessage)];
        chatStopToken = null;
        pendingPlanResponse = null;
        return Task.CompletedTask;
    }

    public void StopInProgress()
    {
        chatStopToken?.Cancel();
    }

    [GeneratedRegex("^[a-zA-Z]{2}-[a-zA-Z]{2}$")]
    private static partial Regex LocaleRegex();

    /// <summary>
    /// Represents a workout session for the AI tool parameter.
    /// </summary>
    public record WorkoutSession(
        [property: Description("The name of the session (e.g., 'Push Day', 'Legs')")] string Name,
        [property: Description("A description of the session")] string? Description,
        [property: Description("The exercises in this session")] WorkoutExercise[] Exercises
    );

    /// <summary>
    /// Base type for all exercises. Use WeightedExercise or CardioExercise.
    /// </summary>
    [JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
    [JsonDerivedType(typeof(WeightedExercise), "weighted")]
    [JsonDerivedType(typeof(CardioExercise), "cardio")]
    public abstract record WorkoutExercise(
        [property: Description("The name of the exercise")] string Name,
        [property: Description("Optional brief notes on how to perform the exercise")]
            string? Notes,
        [property: Description("Optional URL link for the exercise (e.g., a demonstration video)")]
            string? Link
    );

    /// <summary>
    /// A weighted (barbell, dumbbell, machine, etc.) exercise.
    /// </summary>
    public record WeightedExercise(
        string Name,
        string? Notes,
        string? Link,
        [property: Description("The number of sets to perform")] int Sets,
        [property: Description("The number of reps per set")] int RepsPerSet,
        [property: Description(
            "Weight increase on success (in user's preferred units, typically 2.5 for kg or 5 for lbs)"
        )]
            decimal WeightIncreaseOnSuccess,
        [property: Description("Minimum rest time between sets in seconds on success")]
            int MinRestSeconds,
        [property: Description(
            "Maximum rest time between sets in seconds on success (must be >= MinRestSeconds)"
        )]
            int MaxRestSeconds,
        [property: Description(
            "Rest time in seconds after failing to complete all reps (must be >= MaxRestSeconds)"
        )]
            int FailureRestSeconds,
        [property: Description(
            "Whether this exercise is supersetted with the next exercise in the session"
        )]
            bool SupersetWithNext
    ) : WorkoutExercise(Name, Notes, Link);

    /// <summary>
    /// A cardio exercise. Each set can have an independent target (time or distance).
    /// </summary>
    public record CardioExercise(
        string Name,
        string? Notes,
        string? Link,
        [property: Description(
            "The sets in this cardio exercise. Most cardio will have a single set."
        )]
            CardioExerciseSet[] Sets
    ) : WorkoutExercise(Name, Notes, Link);

    /// <summary>
    /// A single set within a cardio exercise.
    /// </summary>
    public record CardioExerciseSet(
        [property: Description("The target for this set")] CardioTarget Target,
        [property: Description("Whether to track duration during this set")] bool TrackDuration,
        [property: Description("Whether to track distance during this set")] bool TrackDistance,
        [property: Description("Whether to track resistance (e.g., bike resistance level)")]
            bool TrackResistance,
        [property: Description("Whether to track incline (e.g., treadmill incline)")]
            bool TrackIncline,
        [property: Description("Whether to track weight (e.g., weighted vest)")] bool TrackWeight,
        [property: Description("Whether to track steps")] bool TrackSteps
    );

    /// <summary>
    /// Target for a cardio set. Use TimeCardioTarget or DistanceCardioTarget.
    /// </summary>
    [JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
    [JsonDerivedType(typeof(TimeCardioTarget), "time")]
    [JsonDerivedType(typeof(DistanceCardioTarget), "distance")]
    public abstract record CardioTarget;

    /// <summary>
    /// A time-based cardio target (e.g., run for 30 minutes).
    /// </summary>
    public record TimeCardioTarget(
        [property: Description("Target duration in seconds (e.g., 1800 for 30 minutes)")]
            int DurationSeconds
    ) : CardioTarget;

    /// <summary>
    /// A distance-based cardio target (e.g., run 5 kilometres).
    /// </summary>
    public record DistanceCardioTarget(
        [property: Description("Target distance value")] decimal Distance,
        [property: Description("Unit of distance: 'metre', 'kilometre', 'mile', or 'yard'")]
            string Unit
    ) : CardioTarget;
}
