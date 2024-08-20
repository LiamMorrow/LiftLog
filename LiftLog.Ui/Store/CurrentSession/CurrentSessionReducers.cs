using System.Collections.Immutable;
using Fluxor;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.CurrentSession;

public static class CurrentSessionReducers
{
    [ReducerMethod]
    public static CurrentSessionState SetCurrentSessionIsHydrated(
        CurrentSessionState state,
        SetCurrentSessionHydratedAction action
    ) => state with { IsHydrated = true };

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
                RecordedExercises = session.RecordedExercises.SetItem(
                    action.ExerciseIndex,
                    exerciseAtIndex with
                    {
                        PotentialSets = exerciseAtIndex.PotentialSets.SetItem(
                            action.SetIndex,
                            setAtIndex with
                            {
                                Set = GetCycledRepCount(setAtIndex.Set, exerciseBlueprint),
                            }
                        ),
                    }
                ),
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
                    Exercises = session.Blueprint.Exercises.RemoveAt(action.ExerciseIndex),
                },
                RecordedExercises = session.RecordedExercises.RemoveAt(action.ExerciseIndex),
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
        var newExerciseBlueprint = action.NewBlueprint;
        var existingExercise = session.RecordedExercises[action.ExerciseIndex];
        var newExercise = existingExercise with
        {
            Blueprint = newExerciseBlueprint,
            PotentialSets = Enumerable
                // Keep existing sets, but add new ones if the new exercise has more sets
                .Range(0, newExerciseBlueprint.Sets)
                .Select(index =>
                    existingExercise.PotentialSets.ElementAtOrDefault(index)
                    ?? new PotentialSet(null, existingExercise.Weight)
                )
                .ToImmutableList(),
        };
        return WithActiveSession(
            state,
            action.Target,
            session with
            {
                Blueprint = session.Blueprint with
                {
                    Exercises = session.Blueprint.Exercises.SetItem(
                        action.ExerciseIndex,
                        newExerciseBlueprint
                    ),
                },
                RecordedExercises = session.RecordedExercises.SetItem(
                    action.ExerciseIndex,
                    newExercise
                ),
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
        var newExerciseBlueprint = action.ExerciseBlueprint;
        var newExercise = new RecordedExercise(
            newExerciseBlueprint,
            0,
            Enumerable
                .Repeat(new PotentialSet(null, 0), newExerciseBlueprint.Sets)
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
                    Exercises = session.Blueprint.Exercises.Add(newExerciseBlueprint),
                },
                RecordedExercises = session.RecordedExercises.Add(newExercise),
            }
        );
    }

    [ReducerMethod]
    public static CurrentSessionState SetExerciseReps(
        CurrentSessionState state,
        SetExerciseRepsAction action
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
                RecordedExercises = session.RecordedExercises.SetItem(
                    action.ExerciseIndex,
                    exerciseAtIndex with
                    {
                        PotentialSets = exerciseAtIndex.PotentialSets.SetItem(
                            action.SetIndex,
                            potentialSetAtIndex with
                            {
                                Set = action.Reps is null
                                    ? null
                                    : new RecordedSet(
                                        action.Reps.Value,
                                        TimeOnly.FromDateTime(DateTime.Now)
                                    ),
                            }
                        ),
                    }
                ),
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
                RecordedExercises = session.RecordedExercises.SetItem(
                    action.ExerciseIndex,
                    exerciseAtIndex with
                    {
                        PerSetWeight = !exerciseAtIndex.PerSetWeight,
                    }
                ),
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
                RecordedExercises = session.RecordedExercises.SetItem(
                    action.ExerciseIndex,
                    exerciseAtIndex with
                    {
                        PotentialSets = exerciseAtIndex.PotentialSets.SetItem(
                            action.SetIndex,
                            setAtIndex with
                            {
                                Weight = action.Weight,
                            }
                        ),
                    }
                ),
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
            .PotentialSets.Select(set =>
                !exerciseAtIndex.PerSetWeight || (set.Weight == previousWeight && set.Set is null)
                    ? set with
                    {
                        Weight = action.Weight,
                    }
                    : set
            )
            .ToImmutableList();
        return WithActiveSession(
            state,
            action.Target,
            session with
            {
                RecordedExercises = session.RecordedExercises.SetItem(
                    action.ExerciseIndex,
                    exerciseAtIndex with
                    {
                        Weight = action.Weight,
                        PotentialSets = newPotentialSets,
                    }
                ),
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
                RecordedExercises = session.RecordedExercises.SetItem(
                    action.ExerciseIndex,
                    exerciseAtIndex with
                    {
                        Notes = action.Notes,
                    }
                ),
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
                    _ => session with { Bodyweight = action.Bodyweight },
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
            null => new RecordedSet(
                exerciseBlueprint.RepsPerSet,
                TimeOnly.FromDateTime(DateTime.Now)
            ),
            // When they completed no reps, we transition back to unset
            { RepsCompleted: 0 } => null,
            // Otherwise, just decrement from the current
            var reps => reps with { RepsCompleted = reps.RepsCompleted - 1 },
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
            SessionTarget.FeedSession => state with { FeedSession = session },
            _ => throw new Exception(),
        };

    private static CurrentSessionState WithActiveSession(
        this CurrentSessionState state,
        SessionTarget target,
        Func<Session?, Session?> sessionMap
    ) =>
        target switch
        {
            SessionTarget.WorkoutSession => state with
            {
                WorkoutSession = sessionMap(state.WorkoutSession),
            },
            SessionTarget.HistorySession => state with
            {
                HistorySession = sessionMap(state.HistorySession),
            },
            SessionTarget.FeedSession => state with { FeedSession = sessionMap(state.FeedSession) },
            _ => throw new Exception(),
        };

    private static Session? ActiveSession(this CurrentSessionState state, SessionTarget target) =>
        target switch
        {
            SessionTarget.WorkoutSession => state.WorkoutSession,
            SessionTarget.HistorySession => state.HistorySession,
            SessionTarget.FeedSession => state.FeedSession,
            _ => throw new Exception(),
        };
}
