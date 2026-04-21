using LiftLog.Api.Authentication;
using LiftLog.Api.Models;
using LiftLog.Api.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace LiftLog.Api.Hubs;

public interface IChatClient
{
    Task ReceiveMessage(AiChatResponse message);
}

[Authorize(AuthenticationSchemes = PurchaseTokenAuthenticationSchemeOptions.SchemeName)]
public class AiWorkoutChatHub(IAiChatDirectory chatDirectory) : Hub<IChatClient>
{
    public async Task SendMessage(string message)
    {
        var planner = chatDirectory.GetChat(Context.ConnectionId);
        await planner.SendMessageAsync(message, Clients.Caller.ReceiveMessage);
    }

    public async Task Introduce(string locale)
    {
        var planner = chatDirectory.GetChat(Context.ConnectionId);
        await planner.Introduce(locale, Clients.Caller.ReceiveMessage);
    }

    public async Task RestartChat()
    {
        var planner = chatDirectory.GetChat(Context.ConnectionId);
        await planner.ClearConversationAsync();
    }

    public Task StopInProgress()
    {
        var planner = chatDirectory.GetChat(Context.ConnectionId);
        planner.StopInProgress();
        return Task.CompletedTask;
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await chatDirectory.CloseChatAsync(Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }
}
