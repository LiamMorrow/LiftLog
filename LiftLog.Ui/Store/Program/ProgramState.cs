using System.Collections.Immutable;
using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.Program;

public record ProgramState(
    bool IsHydrated,
    ImmutableListValue<SessionBlueprint> SessionBlueprints,
    ImmutableListValue<Session> UpcomingSessions,
    bool IsLoadingUpcomingSessions,
    ImmutableDictionary<Guid, Plan> SavedPlans
);

public record Plan(string Name, ImmutableListValue<SessionBlueprint> SessionBlueprints)
{
    public static readonly Guid ActivePlanId = Guid.Empty;
}
