using LiftLog.Api.Models;
using LiftLog.Api.Service;
using Microsoft.AspNetCore.SignalR;

namespace LiftLog.Api.Hubs;

public record ChatMessage(string Id, AiChatResponse Message);

public interface IChatClient
{
    Task ReceiveMessage(ChatMessage message);
}

public class AiWorkoutChatHub(GptChatWorkoutPlanner planner) : Hub<IChatClient>
{
    public async Task SendMessage(string message)
    {
        // TODO auth
        var responseId = Guid.CreateVersion7().ToString();
        await planner.SendMessageAsync(
            Context.ConnectionId,
            message,
            response => Clients.Caller.ReceiveMessage(new ChatMessage(responseId, response))
        );
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await planner.ClearConversationAsync(Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }
}
