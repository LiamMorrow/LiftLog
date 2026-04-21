using System.Collections.Concurrent;
using AutomaticInterface;
using Microsoft.Extensions.AI;

namespace LiftLog.Api.Service;

[GenerateAutomaticInterface]
public class AiChatDirectory(IChatClient chatClient, ILoggerFactory loggerFactory)
    : IAiChatDirectory
{
    private readonly ConcurrentDictionary<string, IAiChatWorkoutPlanner> chatSessions = new();

    public IAiChatWorkoutPlanner GetChat(string connectionId)
    {
        return chatSessions.GetOrAdd(
            connectionId,
            _ => new GenericAiChatWorkoutPlanner(
                chatClient,
                loggerFactory.CreateLogger<GenericAiChatWorkoutPlanner>()
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
