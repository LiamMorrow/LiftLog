using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.Program;

public record SetProgramSessionsAction(ImmutableListSequence<SessionBlueprint> SessionBlueprints);
public record SetProgramSessionAction(int SessionIndex, SessionBlueprint SessionBlueprint);

public record AddProgramSessionAction(SessionBlueprint SessionBlueprint);

public record RehydrateProgramAction();

public record MoveSessionBlueprintUpInProgramAction(SessionBlueprint SessionBlueprint);

public record MoveSessionBlueprintDownInProgramAction(SessionBlueprint SessionBlueprint);

public record RemoveSessionFromProgramAction(SessionBlueprint SessionBlueprint);
