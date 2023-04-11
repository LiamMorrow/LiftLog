using System.Collections.Immutable;
using Fluxor;
using LiftLog.Lib.Models;

namespace LiftLog.WebUi.Store.Program;

public class Reducers
{
    [ReducerMethod]
    public ProgramState UpdateProgram(ProgramState state, UpdateProgramAction action) => state with
    {
        SessionBlueprints = action.SessionBlueprints
    };

    [ReducerMethod]
    public ProgramState MoveSessionBlueprintUpInProgram(ProgramState state,
        MoveSessionBlueprintUpInProgramAction action)
    {
        var index = state.SessionBlueprints.IndexOf(action.SessionBlueprint);
        if (index <= 0)
        {
            return state;
        }

        var toSwap = state.SessionBlueprints[index - 1];

        return state with
        {
            SessionBlueprints = state.SessionBlueprints.SetItem(index, toSwap)
                .SetItem(index - 1, action.SessionBlueprint)
        };
    }
    [ReducerMethod]
    public ProgramState MoveSessionBlueprintDownInProgram(ProgramState state, MoveSessionBlueprintDownInProgramAction action)
    {
        var index = state.SessionBlueprints.IndexOf(action.SessionBlueprint);
        if (index < 0 || index == state.SessionBlueprints.Count -1)
        {
            return state;
        }

        var toSwap = state.SessionBlueprints[index + 1];

        return state with
        {
            SessionBlueprints = state.SessionBlueprints.SetItem(index, toSwap)
                .SetItem(index + 1, action.SessionBlueprint)
        };
    }
}