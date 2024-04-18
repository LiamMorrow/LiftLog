using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.Program;

public record ProgramState(
    bool IsHydrated,
    ImmutableListValue<SessionBlueprint> SessionBlueprints,
    ImmutableListValue<Session> UpcomingSessions,
    bool IsLoadingUpcomingSessions
);
