// ReSharper disable UnusedMember.Global

using Fluxor;

namespace LiftLog.Ui.Store.Program;

public static class Reducers
{
    [ReducerMethod]
    public static ProgramState SetProgramSessions(ProgramState state, SetProgramSessionsAction action) =>
        state with { SessionBlueprints = action.SessionBlueprints };
    
    [ReducerMethod]
    public static ProgramState SetProgramSession(ProgramState state, SetProgramSessionAction action)
    {
        if (action.SessionIndex < 0 || action.SessionIndex >= state.SessionBlueprints.Count)
        {
            return state;
        }

        return state with
        {
            SessionBlueprints = state.SessionBlueprints.SetItem(
                action.SessionIndex,
                action.SessionBlueprint
            )
        };
    }

    [ReducerMethod]
    public static ProgramState AddProgramSession(
        ProgramState state,
        AddProgramSessionAction action
    ) => state with { SessionBlueprints = state.SessionBlueprints.Add(action.SessionBlueprint) };

    [ReducerMethod]
    public static ProgramState MoveSessionBlueprintUpInProgram(
        ProgramState state,
        MoveSessionBlueprintUpInProgramAction action
    )
    {
        var index = state.SessionBlueprints.IndexOf(action.SessionBlueprint);
        if (index <= 0)
        {
            return state;
        }

        var toSwap = state.SessionBlueprints[index - 1];

        return state with
        {
            SessionBlueprints = state.SessionBlueprints
                .SetItem(index, toSwap)
                .SetItem(index - 1, action.SessionBlueprint)
        };
    }

    [ReducerMethod]
    public static ProgramState MoveSessionBlueprintDownInProgram(
        ProgramState state,
        MoveSessionBlueprintDownInProgramAction action
    )
    {
        var index = state.SessionBlueprints.IndexOf(action.SessionBlueprint);
        if (index < 0 || index == state.SessionBlueprints.Count - 1)
        {
            return state;
        }

        var toSwap = state.SessionBlueprints[index + 1];

        return state with
        {
            SessionBlueprints = state.SessionBlueprints
                .SetItem(index, toSwap)
                .SetItem(index + 1, action.SessionBlueprint)
        };
    }

    [ReducerMethod]
    public static ProgramState RemoveSessionFromProgram(
        ProgramState state,
        RemoveSessionFromProgramAction action
    ) => state with { SessionBlueprints = state.SessionBlueprints.Remove(action.SessionBlueprint) };
}
