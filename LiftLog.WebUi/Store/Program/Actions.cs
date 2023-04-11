using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.WebUi.Store.Program;

public record UpdateProgramAction(ImmutableListSequence<SessionBlueprint> SessionBlueprints);

public record RehydrateProgramAction();