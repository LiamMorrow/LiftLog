using Fluxor;

namespace LiftLog.WebUi.Store.Program;

public class Reducers
{
    [ReducerMethod]
    public ProgramState UpdateProgram(ProgramState state, UpdateProgramAction action) => state with
    {
        SessionBlueprints = action.SessionBlueprints
    };
}