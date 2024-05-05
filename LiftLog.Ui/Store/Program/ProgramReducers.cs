// ReSharper disable UnusedMember.Global

using Fluxor;
using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.Program;

public static class ProgramReducers
{
    [ReducerMethod]
    public static ProgramState RehydrateProgram(ProgramState state, SetProgramIsHydratedAction _) =>
        state with
        {
            IsHydrated = true
        };

    [ReducerMethod]
    public static ProgramState FetchUpcomingSessions(
        ProgramState state,
        FetchUpcomingSessionsAction _
    ) => state with { IsLoadingUpcomingSessions = true };

    [ReducerMethod]
    public static ProgramState SetUpcomingSessions(
        ProgramState state,
        SetUpcomingSessionsAction action
    ) =>
        state with
        {
            UpcomingSessions = action.UpcomingSessions,
            IsLoadingUpcomingSessions = false
        };

    [ReducerMethod]
    public static ProgramState SetProgramSessions(
        ProgramState state,
        SetProgramSessionsAction action
    ) => WithSessionBlueprints(state, action.PlanId, _ => action.SessionBlueprints);

    [ReducerMethod]
    public static ProgramState SetProgramSession(ProgramState state, SetProgramSessionAction action)
    {
        if (action.SessionIndex < 0)
        {
            return state;
        }

        return WithSessionBlueprints(
            state,
            action.PlanId,
            s =>
                action.SessionIndex >= s.Count
                    ? s
                    : s.SetItem(action.SessionIndex, action.SessionBlueprint)
        );
    }

    [ReducerMethod]
    public static ProgramState AddProgramSession(
        ProgramState state,
        AddProgramSessionAction action
    ) => WithSessionBlueprints(state, action.PlanId, s => s.Add(action.SessionBlueprint));

    [ReducerMethod]
    public static ProgramState MoveSessionBlueprintUpInProgram(
        ProgramState state,
        MoveSessionBlueprintUpInProgramAction action
    ) =>
        WithSessionBlueprints(
            state,
            action.PlanId,
            s =>
            {
                var index = s.IndexOf(action.SessionBlueprint);
                if (index <= 0)
                {
                    return s;
                }

                var toSwap = s[index - 1];

                return state
                    .SessionBlueprints.SetItem(index, toSwap)
                    .SetItem(index - 1, action.SessionBlueprint);
            }
        );

    [ReducerMethod]
    public static ProgramState MoveSessionBlueprintDownInProgram(
        ProgramState state,
        MoveSessionBlueprintDownInProgramAction action
    ) =>
        WithSessionBlueprints(
            state,
            action.PlanId,
            s =>
            {
                var index = s.IndexOf(action.SessionBlueprint);
                if (index < 0 || index == s.Count - 1)
                {
                    return s;
                }

                var toSwap = s[index + 1];

                return state
                    .SessionBlueprints.SetItem(index, toSwap)
                    .SetItem(index + 1, action.SessionBlueprint);
            }
        );

    [ReducerMethod]
    public static ProgramState RemoveSessionFromProgram(
        ProgramState state,
        RemoveSessionFromProgramAction action
    ) => WithSessionBlueprints(state, action.PlanId, s => s.Remove(action.SessionBlueprint));

    [ReducerMethod]
    public static ProgramState SavePlan(ProgramState state, SavePlanAction action) =>
        state with
        {
            SavedPrograms = state.SavedPrograms.SetItem(action.PlanId, action.ProgramBlueprint)
        };

    private static ProgramState WithSessionBlueprints(
        ProgramState state,
        Guid planId,
        Func<
            ImmutableListValue<SessionBlueprint>,
            ImmutableListValue<SessionBlueprint>
        > sessionBlueprints
    ) =>
        planId switch
        {
            var s when s == Guid.Empty
                => state with
                {
                    SessionBlueprints = sessionBlueprints(state.SessionBlueprints)
                },
            _
                => state with
                {
                    SavedPrograms = state.SavedPrograms.SetItem(
                        planId,
                        state.SavedPrograms[planId] with
                        {
                            Sessions = sessionBlueprints(state.SavedPrograms[planId].Sessions)
                        }
                    )
                }
        };
}
