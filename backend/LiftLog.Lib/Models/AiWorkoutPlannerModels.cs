using System.Collections.Immutable;

namespace LiftLog.Lib.Models;

public enum AppStore
{
    RevenueCat,
}

public record AiWorkoutPlan(
    string Name,
    string Description,
    ImmutableList<SessionBlueprint> Sessions
);
