using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using Anthropic.Models.Messages;
using LiftLog.Api.Models;
using LiftLog.Lib.Utils;

namespace LiftLog.Api.Service;

/// <summary>
/// AI chat workout planner that talks to the Anthropic SDK directly (via the
/// <see cref="IAnthropicMessageStreamer"/> seam) for fine-grained streaming: text
/// deltas are forwarded to the client token-by-token, and tool-input deltas are
/// accumulated into the generated plan. The plan's blueprint is produced against
/// the embedded <c>AiPlan.json</c> schema and forwarded verbatim to the client.
/// </summary>
public partial class AnthropicChatPlannerV2(
    IAnthropicMessageStreamer _streamer,
    Tool _createWorkoutPlanTool,
    string _modelId,
    ILogger<AnthropicChatPlannerV2> _logger
) : IAiChatPlannerV2
{
    private const string SystemMessage = """
        You only cater to requests to create gym plans. If a user asks for a plan, just make one. Don't ask them any more questions.
        You don't need to be overly friendly, you can introduce yourself as the LiftLog ai planner. Don't use markdown.
        DO NOT get sidetracked by nutrition or weird questions. You just create workouts, possibly entire plans for weekly sessions.
        The user may not be speaking english, respond in the language they are speaking or the language they ask you to respond in.
        A workout can consist of exercises which are an amount of reps for an amount of sets. Prefer shorter responses.
        When you have gathered enough information to create a workout plan, use the create_workout_plan tool to generate and return the plan.
        It is okay to ask for clarification or more info, but when you are ready to make a plan, respond with the create_workout_plan tool.
        The user will typically ask you to introduce yourself, you may do so.

        If a user shares their plan with you to iterate on, it is EXTREMELY important that you use the exact same naming as them (casing, and pluralization included)
        when generating a new plan off of it. LiftLog matches history via string matching on exercise name.
        """;

    private const int MaxOutputTokens = 16_000;

    // Conversation history (excludes the system prompt, which is a separate param).
    private List<MessageParam> messages = [];

    // Checked during an inflight chat; if present, cancels generation.
    private CancellationTokenSource? chatStopToken;

    public async Task Introduce(
        string locale,
        string preferredWeightUnit,
        Func<AiChatResponseV2, Task> callback
    )
    {
        if (!LocaleRegex().IsMatch(locale))
        {
            locale = "en-AU";
        }
        messages.Add(
            new MessageParam
            {
                Role = Role.User,
                Content =
                    $"Hi there, can you introduce yourself? Please respond in my locale of {locale}. My preferred weight unit is {preferredWeightUnit}.",
            }
        );
        await GetResponseToCurrentMessagesAsync(callback);
    }

    public async Task SendMessageAsync(string userMessage, Func<AiChatResponseV2, Task> callback)
    {
        messages.Add(new MessageParam { Role = Role.User, Content = userMessage });
        await GetResponseToCurrentMessagesAsync(callback);
    }

    public Task ClearConversationAsync()
    {
        messages = [];
        chatStopToken = null;
        return Task.CompletedTask;
    }

    public void StopInProgress()
    {
        chatStopToken?.Cancel();
    }

    private async Task GetResponseToCurrentMessagesAsync(Func<AiChatResponseV2, Task> callback)
    {
        using var cancellation = new CancellationTokenSource();
        chatStopToken = cancellation;
        var cancellationToken = cancellation.Token;

        var parameters = new MessageCreateParams
        {
            Model = _modelId,
            MaxTokens = MaxOutputTokens,
            System = SystemMessage,
            Messages = messages,
            Tools = new List<ToolUnion> { _createWorkoutPlanTool },
        };

        var textBuilder = new StringBuilder();
        // Tool-use blocks accumulate their partial-JSON input keyed by block index.
        var toolBlocks = new Dictionary<long, ToolUseAccumulator>();

        try
        {
            await foreach (
                var streamEvent in _streamer
                    .CreateStreaming(parameters, cancellationToken)
                    .WithCancellation(cancellationToken)
            )
            {
                switch (streamEvent.Value)
                {
                    case RawContentBlockStartEvent start
                        when TryGetToolUseStart(start, out var toolId, out var toolName):
                        toolBlocks[start.Index] = new ToolUseAccumulator(toolId, toolName);
                        break;

                    case RawContentBlockDeltaEvent delta when delta.Delta.Value is TextDelta text:
                        textBuilder.Append(text.Text);
                        await callback(new AiChatMessageResponseV2(textBuilder.ToString()));
                        break;

                    case RawContentBlockDeltaEvent delta
                        when delta.Delta.Value is InputJsonDelta json
                            && toolBlocks.TryGetValue(delta.Index, out var accumulator):
                        accumulator.Json.Append(json.PartialJson);
                        if (ParsePlan(accumulator) is AiChatPlanResponseV2 pr)
                        {
                            await callback(pr);
                        }
                        break;

                    case RawContentBlockStopEvent stop
                        when toolBlocks.TryGetValue(stop.Index, out var accumulator):
                        if (ParsePlan(accumulator) is AiChatPlanResponseV2 planResponse)
                        {
                            await callback(planResponse);
                        }
                        break;
                }
            }
        }
        catch (OperationCanceledException)
        {
            return;
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error in v2 chat conversation");
            throw;
        }

        if (cancellationToken.IsCancellationRequested)
        {
            return;
        }

        AppendAssistantTurnToHistory(textBuilder.ToString(), toolBlocks.Values);
        TrimHistory();
    }

    /// <summary>
    /// Rebuilds the assistant turn (text + tool_use blocks) into history, followed
    /// by a tool_result for each tool call so the model can iterate on follow-ups.
    /// </summary>
    private void AppendAssistantTurnToHistory(
        string text,
        IReadOnlyCollection<ToolUseAccumulator> tools
    )
    {
        var assistantContent = new List<ContentBlockParam>();
        if (text.Length > 0)
        {
            assistantContent.Add(new TextBlockParam(text));
        }
        foreach (var tool in tools)
        {
            assistantContent.Add(
                new ToolUseBlockParam
                {
                    ID = tool.Id,
                    Name = tool.Name,
                    Input = ParseInput(tool.Json.ToString()),
                }
            );
        }

        if (assistantContent.Count == 0)
        {
            return;
        }

        messages.Add(new MessageParam { Role = Role.Assistant, Content = assistantContent });

        if (tools.Count > 0)
        {
            var toolResults = new List<ContentBlockParam>();
            foreach (var tool in tools)
            {
                toolResults.Add(
                    new ToolResultBlockParam(tool.Id)
                    {
                        Content = "Plan created and sent to the user successfully.",
                    }
                );
            }
            messages.Add(new MessageParam { Role = Role.User, Content = toolResults });
        }
    }

    /// <summary>
    /// Extracts a tool_use block's id and name from a content_block_start event.
    /// Prefers the typed union value, but falls back to the raw JSON because the
    /// content-block union does not always materialize its <c>.Value</c>.
    /// </summary>
    private static bool TryGetToolUseStart(
        RawContentBlockStartEvent start,
        out string id,
        out string name
    )
    {
        if (start.ContentBlock.Value is ToolUseBlock toolUse)
        {
            id = toolUse.ID;
            name = toolUse.Name;
            return true;
        }

        if (
            start.RawData.TryGetValue("content_block", out var contentBlock)
            && contentBlock.ValueKind == JsonValueKind.Object
            && contentBlock.TryGetProperty("type", out var type)
            && type.GetString() == "tool_use"
        )
        {
            id = contentBlock.TryGetProperty("id", out var idElement)
                ? idElement.GetString() ?? ""
                : "";
            name = contentBlock.TryGetProperty("name", out var nameElement)
                ? nameElement.GetString() ?? ""
                : "";
            return true;
        }

        id = "";
        name = "";
        return false;
    }

    private AiChatPlanResponseV2? ParsePlan(ToolUseAccumulator accumulator)
    {
        var json = accumulator.Json.ToString();
        if (json.Length == 0)
        {
            return null;
        }
        var balancedJSON = JsonUtil.BalanceJson(json);
        try
        {
            if (
                JsonNode.Parse(
                    balancedJSON,
                    documentOptions: new JsonDocumentOptions { AllowTrailingCommas = true }
                )
                is not JsonObject obj
            )
            {
                return null;
            }
            var name = obj["name"]?.GetValue<string>() ?? "";
            var version = obj["version"]?.GetValue<int>() ?? 2;
            var description = obj["description"]?.GetValue<string>() ?? "";
            var blueprint = obj["blueprint"]?.DeepClone();
            return new AiChatPlanResponseV2(name, description, blueprint, version);
        }
        catch (JsonException e)
        {
            _logger.LogDebug(e, "Failed to parse v2 plan tool input");
            return null;
        }
    }

    private static IReadOnlyDictionary<string, JsonElement> ParseInput(string json)
    {
        if (json.Length == 0)
        {
            return new Dictionary<string, JsonElement>();
        }
        try
        {
            return JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(json)
                ?? new Dictionary<string, JsonElement>();
        }
        catch (JsonException)
        {
            return new Dictionary<string, JsonElement>();
        }
    }

    // Keep conversation history manageable (last 20 messages).
    private void TrimHistory()
    {
        const int maxMessages = 20;
        if (messages.Count > maxMessages)
        {
            messages = messages[^maxMessages..];
        }
    }

    [GeneratedRegex("^[a-zA-Z]{2}-[a-zA-Z]{2}$")]
    private static partial Regex LocaleRegex();

    private sealed class ToolUseAccumulator(string id, string name)
    {
        public string Id { get; } = id;
        public string Name { get; } = name;
        public StringBuilder Json { get; } = new();
    }
}
