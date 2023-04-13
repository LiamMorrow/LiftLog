using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.WebUi.Store.Program;

public record SetProgramSessionAction(int SessionIndex, SessionBlueprint SessionBlueprint);

public record AddProgramSessionAction(SessionBlueprint SessionBlueprint);

public record RehydrateProgramAction();

public record MoveSessionBlueprintUpInProgramAction(SessionBlueprint SessionBlueprint);

public record MoveSessionBlueprintDownInProgramAction(SessionBlueprint SessionBlueprint);

public record RemoveSessionFromProgramAction(SessionBlueprint SessionBlueprint);
