using System.Collections.Concurrent;
using System.Collections.Immutable;
using System.Diagnostics.CodeAnalysis;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using LiftLog.Api.Models;
using LiftLog.Api.Utils;
using LiftLog.Lib.Models;
using OpenAI;
using OpenAI.Chat;

namespace LiftLog.Api.Service;

public partial class GptChatWorkoutPlanner(
    ChatClient _openAiClient,
    ILogger<GptChatWorkoutPlanner> _logger
)
{
    private static readonly BinaryData aiWorkoutPlanJsonSchema = BinaryData.FromBytes(
        File.ReadAllBytes("./AiWorkoutPlanOrMessage.json")
    );

    // Store conversations per connection ID
    private readonly ConcurrentDictionary<string, List<ChatMessage>> _chatSessions = new();

    // Checked during an inflight chat, if present, will stop generating
    private readonly ConcurrentDictionary<string, CancellationTokenSource> _chatStopTokens = new();

    private List<ChatMessage> GetOrCreateChatSession(string connectionId)
    {
        return _chatSessions.GetOrAdd(
            connectionId,
            _ =>
                [
                    ChatMessage.CreateSystemMessage(
                        $"""
                        You only cater to requests to create gym plans. If a user asks for a plan, just make one. Don't ask them any more questions.
                        DO NOT get sidetracked by nutrition or weird questions. You just create workouts, possibly entire plans for weekly sessions.
                        The user may not be speaking english, respond in the language they are speaking or the language ask you to respond in.
                        A workout can consist of exercises which are an amount of reps for an amount of sets. Prefer shorter responses.
                        Prioritize chatPlan if you can make a plan. It is okay to ask for clarification or more info, but when you are ready to make a plan, respond with a chatPlan.
                        """
                    ),
                ]
        );
    }

    public async Task Introduce(
        string connectionId,
        string locale,
        Func<AiChatResponse, Task> callback
    )
    {
        if (!localeRegex().IsMatch(locale))
        {
            locale = "en-AU";
        }
        var messages = GetOrCreateChatSession(connectionId);
        messages.Add(
            ChatMessage.CreateUserMessage(
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
        // Get or create chat session for this connection
        var messages = GetOrCreateChatSession(connectionId);

        // Add the new user message
        messages.Add(ChatMessage.CreateUserMessage(userMessage));
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
            // Create chat request with conversation history
            var cancellationToken = new CancellationTokenSource();
            _chatStopTokens[connectionId] = cancellationToken;

            var message = "";
            await foreach (
                var streamPortion in _openAiClient
                    .CompleteChatStreamingAsync(
                        messages,
                        new ChatCompletionOptions
                        {
                            ResponseFormat = OpenAI.Chat.ChatResponseFormat.CreateJsonSchemaFormat(
                                "chat_response",
                                aiWorkoutPlanJsonSchema,
                                "Used for all responses. When you are talking to the user, use a messageResponse. When you are sending a plan, use a chatPlan",
                                jsonSchemaIsStrict: true
                            ),
                            StoredOutputEnabled = true,
                        },
                        cancellationToken: cancellationToken.Token
                    )
                    .WithCancellation(cancellationToken.Token)
            )
            {
                foreach (var contentUpdate in streamPortion.ContentUpdate)
                {
                    message += contentUpdate.Text;
                }
                if (PartialJsonParser.TryParsePartialJson(message, out GptChatResponse? response))
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
            }

            if (cancellationToken.IsCancellationRequested)
            {
                return;
            }
            // Add assistant response to conversation history
            messages.Add(ChatMessage.CreateAssistantMessage(message));

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

    public Task ClearConversationAsync(string connectionId)
    {
        _chatSessions.TryRemove(connectionId, out _);
        _chatStopTokens.TryRemove(connectionId, out _);
        return Task.CompletedTask;
    }

    public void StopInProgress(string connectionId)
    {
        if (_chatStopTokens.TryGetValue(connectionId, out var token))
        {
            token.Cancel();
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

    [GeneratedRegex("^[a-zA-Z]{2}-[a-zA-Z]{2}$")]
    private static partial Regex localeRegex();
}
