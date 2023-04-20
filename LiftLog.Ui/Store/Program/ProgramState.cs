using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.Program;

public record ProgramState(ImmutableListSequence<SessionBlueprint> SessionBlueprints);
