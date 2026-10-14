using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace LiftLog.Api.Features;

/// <summary>
/// Disables a controller unless at least one of the given features is enabled. Several features are
/// accepted because some endpoints underpin more than one: user accounts are needed by both the feed
/// and sharing, so they stay reachable while either is on.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false)]
public sealed class FeatureCheckAttribute(params Feature[] features) : Attribute, IResourceFilter
{
    public IReadOnlyList<Feature> Features { get; } = features;

    // A resource filter, not an action filter: this has to run before model binding, otherwise a
    // request to a disabled feature is answered with 415/400 from binding the body it never needed.
    public void OnResourceExecuting(ResourceExecutingContext context)
    {
        var gate = context.HttpContext.RequestServices.GetRequiredService<IFeatureGate>();
        if (!Features.Any(gate.IsEnabled))
        {
            context.Result = new StatusCodeResult(StatusCodes.Status423Locked);
        }
    }

    public void OnResourceExecuted(ResourceExecutedContext context) { }
}
