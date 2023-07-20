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
        var session = ActiveSession(state, action.Target) ?? throw new Exception();
        var exerciseAtIndex = session.RecordedExercises[action.ExerciseIndex];
        var exerciseBlueprint = session.Blueprint.Exercises[action.ExerciseIndex];

        return WithActiveSession(
            state,
            action.Target,
            session with
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
            });
    }

    [ReducerMethod]
    public static CurrentSessionState ClearExerciseReps(
        CurrentSessionState state,
        ClearExerciseRepsAction action
    )
    {
        var session = ActiveSession(state, action.Target) ?? throw new Exception();
        var exerciseAtIndex = session.RecordedExercises[action.ExerciseIndex];

        return WithActiveSession(
            state,
            action.Target,
            session with
            {
                RecordedExercises = session.RecordedExercises.SetItem(
                    action.ExerciseIndex,
                    exerciseAtIndex with
                    {
                        RecordedSets = exerciseAtIndex.RecordedSets.SetItem(action.SetIndex, null)
                    }
                )
            });
    }

    [ReducerMethod]
    public static CurrentSessionState UpdateExerciseWeight(
        CurrentSessionState state,
        UpdateExerciseWeightAction action
    )
    {
        var session = ActiveSession(state, action.Target) ?? throw new Exception();
        var exerciseAtIndex = session.RecordedExercises[action.ExerciseIndex];
        return WithActiveSession(
                  state,
                  action.Target,
                  session with
                  {
                      RecordedExercises = session.RecordedExercises.SetItem(
                          action.ExerciseIndex,
                          exerciseAtIndex with
                          {
                              Kilograms = action.Kilograms
                          }
                      )
                  }
        );
    }

    [ReducerMethod]
    public static CurrentSessionState SetCurrentSession(
        CurrentSessionState state,
        SetCurrentSessionAction action
    ) => WithActiveSession(state, action.Target, action.Session);

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

    private static CurrentSessionState WithActiveSession(
        this CurrentSessionState state,
        SessionTarget target,
        Session? session
    ) => target switch
    {
        SessionTarget.WorkoutSession => state with { WorkoutSession = session },
        SessionTarget.HistorySession => state with { HistorySession = session },
        _ => throw new Exception()
    };

    private static Session? ActiveSession(this CurrentSessionState state, SessionTarget target) =>
        target switch
        {
            SessionTarget.WorkoutSession => state.WorkoutSession,
            SessionTarget.HistorySession => state.HistorySession,
            _ => throw new Exception()
        };
}
