using LiftLog.Api.Authentication;
using LiftLog.Api.Models;
using LiftLog.Api.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace LiftLog.Api.Hubs;

public interface IChatClientV2
{
    Task ReceiveMessage(AiChatResponseV2 message);
}

[Authorize(AuthenticationSchemes = PurchaseTokenAuthenticationSchemeOptions.SchemeName)]
public class AiWorkoutChatHubV2(IAiChatDirectoryV2 chatDirectory, AiPlanToolProvider toolProvider)
    : Hub<IChatClientV2>
{
    public async Task SendMessage(string message, int clientAiPlanVersion)
    {
        if (await RejectIfOutOfDateAsync(clientAiPlanVersion))
        {
            return;
        }
        var planner = chatDirectory.GetChat(Context.ConnectionId);
        await planner.SendMessageAsync(message, Clients.Caller.ReceiveMessage);
    }

    public async Task Introduce(string locale, int clientAiPlanVersion, string preferredWeightUnit)
    {
        if (await RejectIfOutOfDateAsync(clientAiPlanVersion))
        {
            return;
        }
        var planner = chatDirectory.GetChat(Context.ConnectionId);
        await planner.Introduce(locale, preferredWeightUnit, Clients.Caller.ReceiveMessage);
    }

    /// <summary>
    /// When the client's AI plan contract version is behind the server's, tell it
    /// to update and skip generation. Returns true if the request was rejected.
    /// </summary>
    private async Task<bool> RejectIfOutOfDateAsync(int clientAiPlanVersion)
    {
        if (clientAiPlanVersion >= toolProvider.CurrentAiPlanVersion)
        {
            return false;
        }
        await Clients.Caller.ReceiveMessage(
            new AiChatUpdateRequiredResponseV2(toolProvider.CurrentAiPlanVersion)
        );
        return true;
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
