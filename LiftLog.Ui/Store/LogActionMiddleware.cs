using System.Diagnostics;
using Fluxor;
using LiftLog.Ui.Services;
using Microsoft.AspNetCore.Components;
using Microsoft.Extensions.Logging;

namespace LiftLog.Ui.Store;

public class LogActionMiddleware(ILogger<LogActionMiddleware> logger) : Middleware
{
    public override void BeforeDispatch(object action)
    {
        logger.LogInformation("Dispatching action {Action}", action?.GetType());
        base.BeforeDispatch(action);
    }

    public override void AfterDispatch(object action)
    {
        logger.LogInformation("Action {Action} dispatched", action?.GetType());
        base.AfterDispatch(action);
    }
}
