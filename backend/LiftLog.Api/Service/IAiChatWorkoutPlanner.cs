using LiftLog.Api.Models;

namespace LiftLog.Api.Service;

public interface IAiChatWorkoutPlanner
{
    Task Introduce(string locale, Func<AiChatResponse, Task> callback);
    Task SendMessageAsync(string userMessage, Func<AiChatResponse, Task> callback);
    Task ClearConversationAsync();
    void StopInProgress();
}
