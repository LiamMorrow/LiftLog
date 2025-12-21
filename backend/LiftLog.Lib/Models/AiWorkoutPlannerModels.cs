using System.Collections.Immutable;
using System.Text.Json.Serialization;

namespace LiftLog.Lib.Models;

public enum AppStore
{
    Web,
    RevenueCat,
}

public record AiWorkoutPlan(
    string Name,
    string Description,
    ImmutableList<SessionBlueprint> Sessions
);
