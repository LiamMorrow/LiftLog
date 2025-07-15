using System.Collections.Concurrent;
using System.Text.Json;
using System.Text.Json.Nodes;
using LiftLog.Api.Models;
using LiftLog.Lib.Models;
using OpenAI;
using OpenAI.Chat;

namespace LiftLog.Api.Service;

public class GptChatWorkoutPlanner
{
    private static readonly JsonNode aiWorkoutPlanJsonSchema = JsonNode.Parse(
        File.ReadAllText("./AiWorkoutPlan.json")
    )!;
    private static readonly Function GetGymPlanFunction = new(
        "GetGymPlan",
        "Gets a gym plan based on the user's goals and attributes.",
        aiWorkoutPlanJsonSchema
    );
    private readonly OpenAIClient _openAiClient;
    private readonly ILogger<GptChatWorkoutPlanner> _logger;

    // Store conversations per connection ID
    private readonly ConcurrentDictionary<string, List<Message>> _chatSessions = new();

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
                        You must call the plan tool if the user says "GET_PLAN". Do not answer directly unless asking for clarification.
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
            var tools = new List<Tool> { GetGymPlanFunction };

            // Create chat request with conversation history
            var chatRequest = new ChatRequest(
                messages,
                model: OpenAI.Models.Model.GPT4o,
                tools: tools,
                toolChoice: "auto",
                maxTokens: 16_384
            );
            Console.WriteLine(String.Join(',', messages.Select(x => x.Content as string)));

            var message = "";
            string? toolCallName = null;
            var toolCallJson = "";

            var result = await _openAiClient.ChatEndpoint.StreamCompletionAsync(
                chatRequest,
                async res =>
                {
                    var choice = res.FirstChoice;
                    if (choice is { Delta.ToolCalls: [{ Function.Name: not null }] })
                    {
                        toolCallName = "GetGymPlan";
                    }
                    if (choice is { Delta.ToolCalls: [{ Function.Arguments: not null }] })
                    {
                        toolCallJson += choice.Delta.ToolCalls[0].Function.Arguments;
                    }
                    if (toolCallName is null)
                    {
                        if (res.FirstChoice?.Delta?.Content is not null)
                        {
                            message += res.FirstChoice?.Delta.Content;
                            await callback(new AiChatMessageResponse(message));
                        }
                    }
                    else if (TryGetPlan(toolCallJson, out var plan))
                    {
                        await callback(new AiChatPlanResponse(plan));
                    }
                },
                streamUsage: true
            );
            var assistantResponse = result.FirstChoice.Message;

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
        return Task.CompletedTask;
    }

    private bool TryGetPlan(string incompleteJson, out AiWorkoutPlan plan)
    {
        plan = null!;
        // Count the number of JSON openers, and create a json string with the missing closers
        if (string.IsNullOrWhiteSpace(incompleteJson))
            return false;

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
            var completedJson = incompleteJson + (inString ? '"' : "");
            while (closersStack.Count > 0)
            {
                var opener = closersStack.Pop();
                completedJson += opener == '{' ? '}' : ']';
            }

            plan = JsonSerializer.Deserialize<AiWorkoutPlan>(completedJson)!;
            return plan != null;
        }
        catch
        {
            return false;
        }
    }
}
