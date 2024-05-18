using System.Collections.Immutable;
using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.Program;

public record ProgramState(
    bool IsHydrated,
    Guid ActivePlanId,
    ImmutableListValue<Session> UpcomingSessions,
    bool IsLoadingUpcomingSessions,
    ImmutableDictionary<Guid, ProgramBlueprint> SavedPrograms
)
{
    public ImmutableListValue<SessionBlueprint> GetSessionBlueprints(Guid planId) =>
        SavedPrograms[planId].Sessions;

    public ImmutableListValue<SessionBlueprint> GetActivePlanSessionBlueprints() =>
        GetSessionBlueprints(ActivePlanId);
}
