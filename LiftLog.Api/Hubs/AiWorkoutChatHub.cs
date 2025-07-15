using LiftLog.Api.Models;
using LiftLog.Api.Service;
using Microsoft.AspNetCore.SignalR;

namespace LiftLog.Api.Hubs;

public interface IChatClient
{
    Task ReceiveMessage(AiChatResponse message);
}

public class AiWorkoutChatHub(GptChatWorkoutPlanner planner) : Hub<IChatClient>
{
    public async Task SendMessage(string message)
    {
        await planner.SendMessageAsync(
            Context.ConnectionId,
            message,
            Clients.Caller.ReceiveMessage
        );
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await planner.ClearConversationAsync(Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }
}
