using Fluxor;
using LiftLog.Lib.Models;

// ReSharper disable UnusedMember.Global

namespace LiftLog.Ui.Store.SessionEditor;

public static class SessionEditorReducers
{
    [ReducerMethod]
    public static SessionEditorState SetEditingSession(
        SessionEditorState state,
        SetEditingSessionAction action
    ) => new(action.SessionBlueprint);

    [ReducerMethod]
    public static SessionEditorState SetEditingSessionName(
        SessionEditorState state,
        SetEditingSessionNameAction action
    ) =>
        new SessionEditorState(
            state.SessionBlueprint == null
                ? null
                : state.SessionBlueprint with
                {
                    Name = action.Name
                }
        );

    [ReducerMethod]
    public static SessionEditorState AddExerciseAction(
        SessionEditorState state,
        AddExerciseAction action
    ) =>
        new SessionEditorState(
            state.SessionBlueprint == null
                ? null
                : state.SessionBlueprint with
                {
                    Exercises = state.SessionBlueprint.Exercises.Add(action.ExerciseBlueprint)
                }
        );

    [ReducerMethod]
    public static SessionEditorState RemoveExerciseAction(
        SessionEditorState state,
        RemoveExerciseAction action
    ) =>
        new SessionEditorState(
            state.SessionBlueprint == null
                ? null
                : state.SessionBlueprint with
                {
                    Exercises = state.SessionBlueprint.Exercises.Remove(action.ExerciseBlueprint)
                }
        );

    [ReducerMethod]
    public static SessionEditorState MoveExerciseUp(
        SessionEditorState state,
        MoveExerciseUpAction action
    )
    {
        if (state.SessionBlueprint is null)
        {
            return state;
        }

        var index = state.SessionBlueprint.Exercises.IndexOf(action.ExerciseBlueprint);
        if (index <= 0)
        {
            return state;
        }

        var toSwap = state.SessionBlueprint.Exercises[index - 1];

        return new SessionEditorState(
            state.SessionBlueprint with
            {
                Exercises = state.SessionBlueprint.Exercises
                    .SetItem(index, toSwap)
                    .SetItem(index - 1, action.ExerciseBlueprint)
            }
        );
    }

    [ReducerMethod]
    public static SessionEditorState MoveExerciseDown(
        SessionEditorState state,
        MoveExerciseDownAction action
    )
    {
        if (state.SessionBlueprint is null)
        {
            return state;
        }

        var index = state.SessionBlueprint.Exercises.IndexOf(action.ExerciseBlueprint);
        if (index < 0 || index >= state.SessionBlueprint.Exercises.Count - 1)
        {
            return state;
        }

        var toSwap = state.SessionBlueprint.Exercises[index + 1];

        return new SessionEditorState(
            state.SessionBlueprint with
            {
                Exercises = state.SessionBlueprint.Exercises
                    .SetItem(index, toSwap)
                    .SetItem(index + 1, action.ExerciseBlueprint)
            }
        );
    }

    [ReducerMethod]
    public static SessionEditorState SetExerciseInitialWeight(
        SessionEditorState state,
        SetExerciseInitialWeightAction action
    ) =>
        UpdateExerciseIfCan(
            state,
            action.ExerciseIndex,
            blueprint => blueprint with { InitialKilograms = action.InitialKilograms }
        );

    [ReducerMethod]
    public static SessionEditorState SetExerciseKilogramsIncreaseOnSuccess(
        SessionEditorState state,
        SetExerciseKilogramsIncreaseOnSuccessAction action
    ) =>
        UpdateExerciseIfCan(
            state,
            action.ExerciseIndex,
            blueprint =>
                blueprint with
                {
                    KilogramsIncreaseOnSuccess = action.KilogramsIncreaseOnSuccess
                }
        );

    [ReducerMethod]
    public static SessionEditorState SetExerciseName(
        SessionEditorState state,
        SetExerciseNameAction action
    ) =>
        UpdateExerciseIfCan(
            state,
            action.ExerciseIndex,
            blueprint => blueprint with { Name = action.Name }
        );

    [ReducerMethod]
    public static SessionEditorState SetMin(SessionEditorState state, SetRestAction action) =>
        UpdateExerciseIfCan(
            state,
            action.ExerciseIndex,
            blueprint => blueprint with { RestBetweenSets = action.Rest }
        );

    [ReducerMethod]
    public static SessionEditorState IncrementExerciseSets(
        SessionEditorState state,
        IncrementExerciseSetsAction action
    ) =>
        UpdateExerciseIfCan(
            state,
            action.ExerciseIndex,
            blueprint => blueprint with { Sets = Math.Max(0, blueprint.Sets + 1) }
        );

    [ReducerMethod]
    public static SessionEditorState DecrementExerciseSets(
        SessionEditorState state,
        DecrementExerciseSetsAction action
    ) =>
        UpdateExerciseIfCan(
            state,
            action.ExerciseIndex,
            blueprint => blueprint with { Sets = Math.Max(0, blueprint.Sets - 1) }
        );

    [ReducerMethod]
    public static SessionEditorState IncrementExerciseRepsPerSet(
        SessionEditorState state,
        IncrementExerciseRepsPerSetAction action
    ) =>
        UpdateExerciseIfCan(
            state,
            action.ExerciseIndex,
            blueprint => blueprint with { RepsPerSet = Math.Max(0, blueprint.RepsPerSet + 1) }
        );

    [ReducerMethod]
    public static SessionEditorState DecrementExerciseRepsPerSet(
        SessionEditorState state,
        DecrementExerciseRepsPerSetAction action
    ) =>
        UpdateExerciseIfCan(
            state,
            action.ExerciseIndex,
            blueprint => blueprint with { RepsPerSet = Math.Max(0, blueprint.RepsPerSet - 1) }
        );

    private static SessionEditorState UpdateExerciseIfCan(
        SessionEditorState state,
        int index,
        Func<ExerciseBlueprint, ExerciseBlueprint> updator
    )
    {
        if (state.SessionBlueprint is null)
        {
            Console.Error.WriteLine($"Warn: SessionBlueprint is null");
            return state;
        }

        if (index < 0 || index >= state.SessionBlueprint.Exercises.Count)
        {
            Console.Error.WriteLine(
                $"Warn: index {index} out of range {state.SessionBlueprint.Exercises.Count}"
            );
            return state;
        }

        return new SessionEditorState(
            state.SessionBlueprint with
            {
                Exercises = state.SessionBlueprint.Exercises.SetItem(
                    index,
                    updator(state.SessionBlueprint.Exercises[index])
                ),
            }
        );
    }
}
