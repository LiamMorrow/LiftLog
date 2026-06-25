using LiftLog.Api.Models;

namespace LiftLog.Api.Service;

public interface IAiChatPlannerV2
{
    Task Introduce(
        string locale,
        string preferredWeightUnit,
        Func<AiChatResponseV2, Task> callback
    );
    Task SendMessageAsync(string userMessage, Func<AiChatResponseV2, Task> callback);
    Task ClearConversationAsync();
    void StopInProgress();
}
