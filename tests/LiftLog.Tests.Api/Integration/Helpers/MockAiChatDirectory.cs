using LiftLog.Api.Service;

namespace LiftLog.Tests.Api.Integration.Helpers;

public class MockAiChatDirectory(IAiChatWorkoutPlanner chatWorkoutPlanner) : IAiChatDirectory
{
    public Task CloseChatAsync(string connectionId)
    {
        return chatWorkoutPlanner.ClearConversationAsync();
    }

    public IAiChatWorkoutPlanner GetChat(string connectionId)
    {
        return chatWorkoutPlanner;
    }
}
