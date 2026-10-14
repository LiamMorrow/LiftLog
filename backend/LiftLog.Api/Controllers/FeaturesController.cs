using LiftLog.Api.Features;
using LiftLog.Api.Models;
using Microsoft.AspNetCore.Mvc;

namespace LiftLog.Api.Controllers;

// Deliberately unauthenticated and ungated: this is how a client discovers what the instance does
// before it holds credentials for any of it.
[ApiController]
[Route("[controller]")]
public class FeaturesController(IFeatureGate featureGate) : ControllerBase
{
    [HttpGet]
    public FeaturesResponse Get() =>
        new(
            Feed: featureGate.IsEnabled(Feature.Feed),
            Sharing: featureGate.IsEnabled(Feature.Sharing),
            AiPlanner: featureGate.IsEnabled(Feature.AiPlanner),
            Backup: featureGate.IsEnabled(Feature.Backup)
        );
}
