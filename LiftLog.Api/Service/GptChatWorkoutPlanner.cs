using System.Collections.Concurrent;
using System.Collections.Immutable;
using System.Diagnostics.CodeAnalysis;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using LiftLog.Api.Models;
using LiftLog.Lib.Models;
using OpenAI;
using OpenAI.Chat;

namespace LiftLog.Api.Service;

public class GptChatWorkoutPlanner
{
    private static readonly JsonNode aiWorkoutPlanJsonSchema = JsonNode.Parse(
        File.ReadAllText("./AiWorkoutPlanOrMessage.json")
    )!;

    private readonly OpenAIClient _openAiClient;
    private readonly ILogger<GptChatWorkoutPlanner> _logger;

    // Store conversations per connection ID
    private readonly ConcurrentDictionary<string, List<Message>> _chatSessions = new();

    // Checked during an inflight chat, if present, will stop generating
    private readonly ConcurrentDictionary<string, CancellationTokenSource> _chatStopTokens = new();

    public GptChatWorkoutPlanner(OpenAIClient openAiClient, ILogger<GptChatWorkoutPlanner> logger)
    {
        _openAiClient = openAiClient;
        _logger = logger;
    }

    private List<Message> GetOrCreateChatSession(string connectionId)
    {
        return _chatSessions.GetOrAdd(
            connectionId,
            _ =>
                [
                    new(
                        Role.System,
                        """
                        You only cater to requests to create gym plans. If a user asks for a plan, just make one. Don't ask them any more questions.
                        DO NOT get sidetracked by nutrition or weird questions. You just create workouts, possibly entire plans for weekly sessions.
                        A workout can consist of exercises which are an amount of reps for an amount of sets. Prefer shorter responses.
                        PRIORITIZE TOOL CALLS if you can make a plan. It is okay to ask for clarification or more info, but when you are ready to make a plan, USE THE TOOL.
                        """
                    ),
                ]
        );
    }

    public async Task SendMessageAsync(
        string connectionId,
        string userMessage,
        Func<AiChatResponse, Task> callback
    )
    {
        try
        {
            // Get or create chat session for this connection
            var messages = GetOrCreateChatSession(connectionId);

            // Add the new user message
            messages.Add(new Message(Role.User, userMessage));

            // Create chat request with conversation history
            var chatRequest = new ChatRequest(
                messages,
                model: OpenAI.Models.Model.GPT4o,
                maxTokens: 16_384,
                responseFormat: ChatResponseFormat.JsonSchema,
                jsonSchema: new JsonSchema("response", aiWorkoutPlanJsonSchema)
            );

            var message = "";
            var cancellationToken = new CancellationTokenSource();
            _chatStopTokens[connectionId] = cancellationToken;

            var result = await _openAiClient.ChatEndpoint.StreamCompletionAsync(
                chatRequest,
                async res =>
                {
                    if (_chatStopTokens[connectionId].IsCancellationRequested)
                    {
                        return;
                    }
                    var choice = res.FirstChoice;
                    if (choice?.Delta?.Content is not null)
                    {
                        message += choice.Delta.Content;
                    }
                    else if (choice?.Message?.Content is not null)
                    {
                        message = choice.Message.Content;
                    }
                    if (TryParsePartialResponse(message, out var response))
                    {
                        switch (response.Response)
                        {
                            case GptChatResponseWithMessage m:
                                await callback(new AiChatMessageResponse(m.Message));
                                break;
                            case GptWorkoutPlan w:
                                await callback(ToAiPlan(w));
                                break;
                        }
                    }
                },
                streamUsage: true,
                cancellationToken: cancellationToken.Token
            );
            var assistantResponse = result.FirstChoice.Message;

            if (cancellationToken.IsCancellationRequested)
            {
                return;
            }
            // Add assistant response to conversation history
            messages.Add(assistantResponse);

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
        catch (TaskCanceledException)
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

    private static AiChatPlanResponse ToAiPlan(GptWorkoutPlan plan)
    {
        return new AiChatPlanResponse(
            new AiWorkoutPlan(
                plan.Name ?? "",
                plan.Description ?? "",
                plan.Sessions?.Select(s => new SessionBlueprint(
                        s.Name ?? "",
                        s.Exercises?.Select(e => new ExerciseBlueprint(
                                e.Name ?? "",
                                e.Sets ?? 0,
                                e.RepsPerSet ?? 0,
                                e.WeightIncreaseOnSuccess ?? 0,
                                new Rest(
                                    TimeSpan.FromSeconds(e.RestBetweenSets?.MinRestSeconds ?? 0),
                                    TimeSpan.FromSeconds(e.RestBetweenSets?.MaxRestSeconds ?? 0),
                                    TimeSpan.FromSeconds(e.RestBetweenSets?.FailureRestSeconds ?? 0)
                                ),
                                false,
                                Notes: e.Notes ?? "",
                                Link: ""
                            ))
                            .ToImmutableList() ?? [],
                        Notes: s.Description ?? ""
                    ))
                    .ToImmutableList() ?? []
            )
        );
    }

    public Task ClearConversationAsync(string connectionId)
    {
        _chatSessions.TryRemove(connectionId, out _);
        return Task.CompletedTask;
    }

    static JsonSerializerOptions jsonSerializerOptions = new JsonSerializerOptions(
        JsonSerializerOptions.Default
    )
    {
        AllowOutOfOrderMetadataProperties = true,
    };

    private bool TryParsePartialResponse(
        string incompleteJson,
        [NotNullWhen(true)] out GptChatResponse? response
    )
    {
        response = null;
        // Count the number of JSON openers, and create a json string with the missing closers
        if (string.IsNullOrWhiteSpace(incompleteJson))
            return false;

        try
        {
            response = JsonSerializer.Deserialize<GptChatResponse>(
                incompleteJson,
                jsonSerializerOptions
            );
        }
        catch { }
        if (response is not null)
        {
            return true;
        }
        string completedJson = "";

        try
        {
            var closersStack = new Stack<char>();
            bool inString = false;
            bool escape = false;

            for (int i = 0; i < incompleteJson.Length; i++)
            {
                char c = incompleteJson[i];
                if (escape)
                {
                    escape = false;
                    continue;
                }
                if (c == '\\')
                {
                    escape = true;
                    continue;
                }
                if (c == '"')
                {
                    inString = !inString;
                    continue;
                }
                if (inString)
                    continue;

                if (c == '{' || c == '[')
                    closersStack.Push(c);
                else if (c == '}')
                {
                    if (closersStack.Count > 0 && closersStack.Peek() == '{')
                        closersStack.Pop();
                }
                else if (c == ']')
                {
                    if (closersStack.Count > 0 && closersStack.Peek() == '[')
                        closersStack.Pop();
                }
            }

            // Build the completed JSON string
            completedJson = incompleteJson + (inString ? '"' : "");
            while (closersStack.Count > 0)
            {
                var opener = closersStack.Pop();
                completedJson += opener == '{' ? '}' : ']';
            }

            response = JsonSerializer.Deserialize<GptChatResponse>(
                completedJson,
                jsonSerializerOptions
            )!;
            return response != null;
        }
        catch (Exception e)
        {
            Console.WriteLine(completedJson);
            Console.Error.WriteLine(e);

            return false;
        }
    }

    public void StopInProgress(string connectionId)
    {
        if (_chatStopTokens.TryGetValue(connectionId, out var token))
        {
            token.Cancel();
        }
    }

    private record GptChatResponse(GptResponse Response);

    [JsonDerivedType(typeof(GptChatResponseWithMessage), "messageResponse")]
    [JsonDerivedType(typeof(GptWorkoutPlan), "chatPlan")]
    [JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
    private abstract record GptResponse();

    private record GptChatResponseWithMessage(string Message) : GptResponse;

    private record GptWorkoutPlan(
        string? Name,
        string? Description,
        List<GptSessionBlueprint>? Sessions
    ) : GptResponse;

    private record GptSessionBlueprint(
        string? Name,
        List<GptExerciseBlueprint>? Exercises,
        string? Description
    );

    private record GptExerciseBlueprint(
        string? Name,
        int? Sets,
        int? RepsPerSet,
        decimal? WeightIncreaseOnSuccess,
        GptRest? RestBetweenSets,
        string? Notes
    );

    private record GptRest(int MinRestSeconds, int MaxRestSeconds, int FailureRestSeconds);
}
