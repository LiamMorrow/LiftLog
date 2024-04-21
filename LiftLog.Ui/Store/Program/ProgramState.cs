using System.Collections.Immutable;
using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.Program;

public record ProgramState(
    bool IsHydrated,
    ImmutableListValue<SessionBlueprint> SessionBlueprints,
    ImmutableListValue<Session> UpcomingSessions,
    bool IsLoadingUpcomingSessions,
    ImmutableDictionary<Guid, ProgramBlueprint> SavedPrograms
)
{
    public ImmutableListValue<SessionBlueprint> GetSessionBlueprints(Guid planId) =>
        planId == Guid.Empty ? SessionBlueprints : SavedPrograms[planId].Sessions;
}
