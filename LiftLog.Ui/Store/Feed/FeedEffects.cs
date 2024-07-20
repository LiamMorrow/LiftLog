using Fluxor;
using Microsoft.Extensions.Logging;

namespace LiftLog.Ui.Store.Feed;

public partial class FeedEffects
{
    [EffectMethod]
    public Task HandleFeedApiErrorAction(FeedApiErrorAction action, IDispatcher dispatcher)
    {
        logger.LogError(
            action.ApiError.Exception,
            "{Message}. {ActionName}. {Action}. {ApiError}",
            action.Action.GetType().Name,
            action.Message,
            action.Action,
            action.ApiError
        );
        return Task.CompletedTask;
    }
}
