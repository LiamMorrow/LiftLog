using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.WebUi.Store.Program;

public record ProgramState(ImmutableListSequence<SessionBlueprint> SessionBlueprints);