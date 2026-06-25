using System.Collections.Concurrent;
using AutomaticInterface;

namespace LiftLog.Api.Service;

[GenerateAutomaticInterface]
public class AiChatDirectoryV2(
    IAnthropicMessageStreamer streamer,
    AiPlanToolProvider toolProvider,
    IConfiguration configuration,
    ILoggerFactory loggerFactory
) : IAiChatDirectoryV2
{
    private readonly ConcurrentDictionary<string, IAiChatPlannerV2> chatSessions = new();

    private readonly string modelId =
        configuration.GetValue<string?>("AnthropicModelId") ?? "claude-sonnet-4-6";

    public IAiChatPlannerV2 GetChat(string connectionId)
    {
        return chatSessions.GetOrAdd(
            connectionId,
            _ => new AnthropicChatPlannerV2(
                streamer,
                toolProvider.Tool,
                modelId,
                loggerFactory.CreateLogger<AnthropicChatPlannerV2>()
            )
        );
    }

    public async Task CloseChatAsync(string connectionId)
    {
        if (chatSessions.Remove(connectionId, out var chat))
        {
            await chat.ClearConversationAsync();
        }
    }
}
