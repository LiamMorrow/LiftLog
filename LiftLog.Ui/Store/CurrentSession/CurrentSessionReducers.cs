using System.Collections.Immutable;
using Fluxor;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.CurrentSession;

public static class CurrentSessionReducers
{
    [ReducerMethod]
    public static CurrentSessionState SetActiveSessionDate(
        CurrentSessionState state,
        SetActiveSessionDateAction action
    )
    {
        var session = ActiveSession(state, action.Target) ?? throw new Exception();

        return WithActiveSession(state, action.Target, session with { Date = action.Date });
    }

    [ReducerMethod]
    public static CurrentSessionState CycleExerciseReps(
        CurrentSessionState state,
        CycleExerciseRepsAction action
    )
    {
        var session = ActiveSession(state, action.Target) ?? throw new Exception();
        var exerciseAtIndex = session.RecordedExercises[action.ExerciseIndex];
        var exerciseBlueprint = session.Blueprint.Exercises[action.ExerciseIndex];
        var setAtIndex = exerciseAtIndex.PotentialSets[action.SetIndex];
        var sessionDate = session.Date;
        if (!session.IsStarted)
        {
            sessionDate = DateOnly.FromDateTime(DateTime.Now);
        }

        return WithActiveSession(
            state,
            action.Target,
            session with
            {
                Date = sessionDate,
                RecordedExercises = session
                    .RecordedExercises
                    .SetItem(
                        action.ExerciseIndex,
                        exerciseAtIndex with
                        {
                            PotentialSets = exerciseAtIndex
                                .PotentialSets
                                .SetItem(
                                    action.SetIndex,
                                    setAtIndex with
                                    {
                                        Set = GetCycledRepCount(setAtIndex.Set, exerciseBlueprint)
                                    }
                                )
                        }
                    )
            }
        );
    }

    [ReducerMethod]
    public static CurrentSessionState RemoveExerciseFromActiveSession(
        CurrentSessionState state,
        RemoveExerciseFromActiveSessionAction action
    )
    {
        var session = ActiveSession(state, action.Target) ?? throw new Exception();
        return WithActiveSession(
            state,
            action.Target,
            session with
            {
                Blueprint = session.Blueprint with
                {
                    Exercises = session.Blueprint.Exercises.RemoveAt(action.ExerciseIndex)
                },
                RecordedExercises = session.RecordedExercises.RemoveAt(action.ExerciseIndex)
            }
        );
    }

    [ReducerMethod]
    public static CurrentSessionState EditExerciseInActiveSession(
        CurrentSessionState state,
        EditExerciseInActiveSessionAction action
    )
    {
        var session = ActiveSession(state, action.Target) ?? throw new Exception();
        var newExerciseBlueprint = session.Blueprint.Exercises[action.ExerciseIndex] with
        {
            Name = action.Exercise.Name,
            Sets = action.Exercise.Sets,
            RepsPerSet = action.Exercise.Reps
        };
        var existingExercise = session.RecordedExercises[action.ExerciseIndex];
        var newExercise = existingExercise with
        {
            Blueprint = newExerciseBlueprint,
            Weight = action.Exercise.Weight,
            PotentialSets = Enumerable
                .Range(0, newExerciseBlueprint.Sets)
                .Select(
                    index =>
                        existingExercise.PotentialSets.ElementAtOrDefault(index)
                        ?? new PotentialSet(null, action.Exercise.Weight)
                )
                .ToImmutableList()
        };
        return WithActiveSession(
            state,
            action.Target,
            session with
            {
                Blueprint = session.Blueprint with
                {
                    Exercises = session
                        .Blueprint
                        .Exercises
                        .SetItem(action.ExerciseIndex, newExerciseBlueprint)
                },
                RecordedExercises = session
                    .RecordedExercises
                    .SetItem(action.ExerciseIndex, newExercise)
            }
        );
    }

    [ReducerMethod]
    public static CurrentSessionState AddExerciseToActiveSession(
        CurrentSessionState state,
        AddExerciseToActiveSessionAction action
    )
    {
        var session = ActiveSession(state, action.Target) ?? throw new Exception();
        var newExerciseBlueprint = new ExerciseBlueprint(
            Name: action.Exercise.Name,
            Sets: action.Exercise.Sets,
            RepsPerSet: action.Exercise.Reps,
            InitialWeight: action.Exercise.Weight,
            WeightIncreaseOnSuccess: 0,
            RestBetweenSets: Rest.Medium,
            false
        );
        var newExercise = new RecordedExercise(
            newExerciseBlueprint,
            action.Exercise.Weight,
            Enumerable
                .Range(0, newExerciseBlueprint.Sets)
                .Select(_ => new PotentialSet(null, action.Exercise.Weight))
                .ToImmutableList(),
            null,
            false
        );
        return WithActiveSession(
            state,
            action.Target,
            session with
            {
                Blueprint = session.Blueprint with
                {
                    Exercises = session.Blueprint.Exercises.Add(newExerciseBlueprint)
                },
                RecordedExercises = session.RecordedExercises.Add(newExercise)
            }
        );
    }

    [ReducerMethod]
    public static CurrentSessionState ClearExerciseReps(
        CurrentSessionState state,
        ClearExerciseRepsAction action
    )
    {
        var session = ActiveSession(state, action.Target) ?? throw new Exception();
        var exerciseAtIndex = session.RecordedExercises[action.ExerciseIndex];
        var potentialSetAtIndex = exerciseAtIndex.PotentialSets[action.SetIndex];

        return WithActiveSession(
            state,
            action.Target,
            session with
            {
                RecordedExercises = session
                    .RecordedExercises
                    .SetItem(
                        action.ExerciseIndex,
                        exerciseAtIndex with
                        {
                            PotentialSets = exerciseAtIndex
                                .PotentialSets
                                .SetItem(action.SetIndex, potentialSetAtIndex with { Set = null })
                        }
                    )
            }
        );
    }

    [ReducerMethod]
    public static CurrentSessionState ToggleExercisePerSetWeight(
        CurrentSessionState state,
        ToggleExercisePerSetWeightAction action
    )
    {
        var session = ActiveSession(state, action.Target) ?? throw new Exception();
        var exerciseAtIndex = session.RecordedExercises[action.ExerciseIndex];
        return WithActiveSession(
            state,
            action.Target,
            session with
            {
                RecordedExercises = session
                    .RecordedExercises
                    .SetItem(
                        action.ExerciseIndex,
                        exerciseAtIndex with
                        {
                            PerSetWeight = !exerciseAtIndex.PerSetWeight
                        }
                    )
            }
        );
    }

    [ReducerMethod]
    public static CurrentSessionState UpdateWeightForSet(
        CurrentSessionState state,
        UpdateWeightForSetAction action
    )
    {
        var session = ActiveSession(state, action.Target) ?? throw new Exception();
        var exerciseAtIndex = session.RecordedExercises[action.ExerciseIndex];
        var setAtIndex = exerciseAtIndex.PotentialSets[action.SetIndex];
        return WithActiveSession(
            state,
            action.Target,
            session with
            {
                RecordedExercises = session
                    .RecordedExercises
                    .SetItem(
                        action.ExerciseIndex,
                        exerciseAtIndex with
                        {
                            PotentialSets = exerciseAtIndex
                                .PotentialSets
                                .SetItem(
                                    action.SetIndex,
                                    setAtIndex with
                                    {
                                        Weight = action.Weight
                                    }
                                )
                        }
                    )
            }
        );
    }

    [ReducerMethod]
    public static CurrentSessionState UpdateExerciseWeight(
        CurrentSessionState state,
        UpdateExerciseWeightAction action
    )
    {
        var session = ActiveSession(state, action.Target) ?? throw new Exception();
        var exerciseAtIndex = session.RecordedExercises[action.ExerciseIndex];
        var previousWeight = exerciseAtIndex.Weight;
        var newPotentialSets = exerciseAtIndex
            .PotentialSets
            .Select(
                set =>
                    !exerciseAtIndex.PerSetWeight
                    || (set.Weight == previousWeight && set.Set is null)
                        ? set with
                        {
                            Weight = action.Weight
                        }
                        : set
            )
            .ToImmutableList();
        return WithActiveSession(
            state,
            action.Target,
            session with
            {
                RecordedExercises = session
                    .RecordedExercises
                    .SetItem(
                        action.ExerciseIndex,
                        exerciseAtIndex with
                        {
                            Weight = action.Weight,
                            PotentialSets = newPotentialSets
                        }
                    )
            }
        );
    }

    [ReducerMethod]
    public static CurrentSessionState SetLatestSetTimerNotificationId(
        CurrentSessionState state,
        SetLatestSetTimerNotificationIdAction action
    ) => state with { LatestSetTimerNotificationId = action.Id };

    [ReducerMethod]
    public static CurrentSessionState SetCurrentSession(
        CurrentSessionState state,
        SetCurrentSessionAction action
    ) => WithActiveSession(state, action.Target, action.Session);

    [ReducerMethod]
    public static CurrentSessionState UpdateNotesForExercise(
        CurrentSessionState state,
        UpdateNotesForExerciseAction action
    )
    {
        var session = ActiveSession(state, action.Target) ?? throw new Exception();
        var exerciseAtIndex = session.RecordedExercises[action.ExerciseIndex];
        return WithActiveSession(
            state,
            action.Target,
            session with
            {
                RecordedExercises = session
                    .RecordedExercises
                    .SetItem(action.ExerciseIndex, exerciseAtIndex with { Notes = action.Notes })
            }
        );
    }

    [ReducerMethod]
    public static CurrentSessionState UpdateBodyweight(
        CurrentSessionState state,
        UpdateBodyweightAction action
    ) =>
        WithActiveSession(
            state,
            action.Target,
            session =>
                session switch
                {
                    null => session,
                    _ => session with { Bodyweight = action.Bodyweight }
                }
        );

    private static RecordedSet? GetCycledRepCount(
        RecordedSet? recordedSet,
        ExerciseBlueprint exerciseBlueprint
    )
    {
        return recordedSet switch
        {
            // When unset - we say the user completed all reps
            null
                => new RecordedSet(
                    exerciseBlueprint.RepsPerSet,
                    TimeOnly.FromDateTime(DateTime.Now)
                ),
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
    ) =>
        target switch
        {
            SessionTarget.WorkoutSession => state with { WorkoutSession = session },
            SessionTarget.HistorySession => state with { HistorySession = session },
            _ => throw new Exception()
        };

    private static CurrentSessionState WithActiveSession(
        this CurrentSessionState state,
        SessionTarget target,
        Func<Session?, Session?> sessionMap
    ) =>
        target switch
        {
            SessionTarget.WorkoutSession
                => state with
                {
                    WorkoutSession = sessionMap(state.WorkoutSession)
                },
            SessionTarget.HistorySession
                => state with
                {
                    HistorySession = sessionMap(state.HistorySession)
                },
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
