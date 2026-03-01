using System.Collections.Concurrent;
using System.Collections.Immutable;
using System.ComponentModel;
using System.Text.Json;
using System.Text.Json.Nodes;
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

    // Store conversations per connection ID
    private readonly ConcurrentDictionary<string, List<ChatMessage>> _chatSessions = new();

    // Checked during an inflight chat, if present, will stop generating
    private readonly ConcurrentDictionary<string, CancellationTokenSource> _chatStopTokens = new();

    // Store the latest plan response per connection (used for tool call results)
    private readonly ConcurrentDictionary<string, AiChatPlanResponse?> _pendingPlanResponses =
        new();

    private List<ChatMessage> GetOrCreateChatSession(string connectionId)
    {
        return _chatSessions.GetOrAdd(
            connectionId,
            _ => [new ChatMessage(ChatRole.System, SystemMessage)]
        );
    }

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

    public async Task Introduce(
        string connectionId,
        string locale,
        Func<AiChatResponse, Task> callback
    )
    {
        if (!LocaleRegex().IsMatch(locale))
        {
            locale = "en-AU";
        }
        var messages = GetOrCreateChatSession(connectionId);
        messages.Add(
            new ChatMessage(
                ChatRole.User,
                $"Hi there, can you introduce yourself? Please respond in my locale of {locale}"
            )
        );

        await GetResponseToCurrentMessagesAsync(connectionId, callback);
    }

    public async Task SendMessageAsync(
        string connectionId,
        string userMessage,
        Func<AiChatResponse, Task> callback
    )
    {
        var messages = GetOrCreateChatSession(connectionId);
        messages.Add(new ChatMessage(ChatRole.User, userMessage));
        await GetResponseToCurrentMessagesAsync(connectionId, callback);
    }

    private async Task GetResponseToCurrentMessagesAsync(
        string connectionId,
        Func<AiChatResponse, Task> callback
    )
    {
        try
        {
            var messages = GetOrCreateChatSession(connectionId);
            var cancellationToken = new CancellationTokenSource();
            _chatStopTokens[connectionId] = cancellationToken;
            _pendingPlanResponses[connectionId] = null;

            // Create the workout plan tool
            var workoutPlanTool = AIFunctionFactory.Create(
                CreateWorkoutPlan,
                new AIFunctionFactoryOptions { Name = "create_workout_plan" }
            );

            var chatOptions = new ChatOptions { Tools = [workoutPlanTool] };

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

                // Check for function call results
                foreach (var content in update.Contents)
                {
                    if (content is FunctionCallContent functionCall)
                    {
                        // The AI is requesting to call a tool
                        await ProcessFunctionCallAsync(
                            connectionId,
                            functionCall,
                            callback,
                            workoutPlanTool
                        );
                    }
                }
            }

            if (cancellationToken.IsCancellationRequested)
            {
                return;
            }

            // Build the response and add to history
            var response = updates.ToChatResponse();
            messages.AddMessages(response);

            // If there was a pending plan response from a tool call, the function result was already added
            // Check if we need to continue the conversation after a tool call
            if (
                _pendingPlanResponses.TryGetValue(connectionId, out var planResponse)
                && planResponse != null
            )
            {
                // Plan was sent via callback during tool processing
                _pendingPlanResponses.TryRemove(connectionId, out _);
            }

            // Keep conversation history manageable (last 20 messages)
            if (messages.Count > 21) // System message + 20 conversation messages
            {
                var systemMessage = messages[0];
                var recentMessages = messages[2..];
                messages.Clear();
                messages.Add(systemMessage);
                messages.AddRange(recentMessages);
            }
        }
        catch (OperationCanceledException)
        {
            return;
        }
        catch (Exception e)
        {
            _logger.LogError(
                e,
                "Error in chat conversation for connection {ConnectionId}",
                connectionId
            );
            throw;
        }
    }

    private async Task ProcessFunctionCallAsync(
        string connectionId,
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
                    _pendingPlanResponses[connectionId] = deserialized;
                    await callback(deserialized);

                    // Add the function call result to the conversation
                    var messages = GetOrCreateChatSession(connectionId);
                    messages.Add(
                        new ChatMessage(
                            ChatRole.Tool,
                            [
                                new FunctionResultContent(
                                    functionCall.CallId,
                                    "Plan created and sent to user successfully"
                                ),
                            ]
                        )
                    );
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error invoking workout plan tool for connection {ConnectionId}",
                    connectionId
                );
            }
        }
    }

    public Task ClearConversationAsync(string connectionId)
    {
        _chatSessions.TryRemove(connectionId, out _);
        _chatStopTokens.TryRemove(connectionId, out _);
        _pendingPlanResponses.TryRemove(connectionId, out _);
        return Task.CompletedTask;
    }

    public void StopInProgress(string connectionId)
    {
        if (_chatStopTokens.TryGetValue(connectionId, out var token))
        {
            token.Cancel();
        }
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
    /// Represents an exercise for the AI tool parameter.
    /// </summary>
    public record WorkoutExercise(
        [property: Description("The name of the exercise")] string Name,
        [property: Description("The number of sets to perform")] int Sets,
        [property: Description("The number of reps per set (or seconds if timed)")] int RepsPerSet,
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
        [property: Description("Optional brief notes on how to perform the exercise")] string? Notes
    );
}
