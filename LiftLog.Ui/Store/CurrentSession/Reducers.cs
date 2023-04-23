using Fluxor;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.CurrentSession;

public static class Reducers
{
    [ReducerMethod]
    public static CurrentSessionState CycleExerciseReps(
        CurrentSessionState state,
        CycleExerciseRepsAction action
    )
    {
        if (state.Session is null)
        {
            throw new Exception();
        }
        var session = state.Session;
        var exerciseAtIndex = session.RecordedExercises[action.ExerciseIndex];
        var exerciseBlueprint = state.Session.Blueprint.Exercises[action.ExerciseIndex];

        return state with
        {
            Session = session with
            {
                RecordedExercises = session.RecordedExercises.SetItem(
                    action.ExerciseIndex,
                    exerciseAtIndex with
                    {
                        RecordedSets = exerciseAtIndex.RecordedSets.SetItem(
                            action.SetIndex,
                            GetCycledRepCount(
                                exerciseAtIndex.RecordedSets[action.SetIndex],
                                exerciseBlueprint
                            )
                        )
                    }
                )
            }
        };
    }

    [ReducerMethod]
    public static CurrentSessionState UpdateExerciseWeight(
        CurrentSessionState state,
        UpdateExerciseWeightAction action
    )
    {
        if (state.Session is null)
        {
            throw new Exception();
        }
        var session = state.Session;
        var exerciseAtIndex = session.RecordedExercises[action.ExerciseIndex];

        return state with
        {
            Session = session with
            {
                RecordedExercises = session.RecordedExercises.SetItem(
                    action.ExerciseIndex,
                    exerciseAtIndex with
                    {
                        Kilograms = action.Kilograms
                    }
                )
            }
        };
    }

    [ReducerMethod]
    public static CurrentSessionState SetCurrentSession(
        CurrentSessionState state,
        SetCurrentSessionAction action
    ) => state with { Session = action.Session };

    private static RecordedSet? GetCycledRepCount(
        RecordedSet? recordedSet,
        ExerciseBlueprint exerciseBlueprint
    )
    {
        return recordedSet switch
        {
            // When unset - we say the user completed all reps
            null => new RecordedSet(exerciseBlueprint.RepsPerSet, DateTimeOffset.UtcNow),
            // When they completed no reps, we transition back to unset
            { RepsCompleted: 0 } => null,
            // Otherwise, just decrement from the current
            var reps => reps with { RepsCompleted = reps.RepsCompleted - 1 }
        };
    }
}
