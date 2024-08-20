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
        new(
            state.SessionBlueprint == null
                ? null
                : state.SessionBlueprint with
                {
                    Name = action.Name,
                }
        );

    [ReducerMethod]
    public static SessionEditorState SetEditingSessionNotes(
        SessionEditorState state,
        SetEditingSessionNotesAction action
    ) =>
        new(
            state.SessionBlueprint == null
                ? null
                : state.SessionBlueprint with
                {
                    Notes = action.Notes,
                }
        );

    [ReducerMethod]
    public static SessionEditorState AddExerciseAction(
        SessionEditorState state,
        AddExerciseAction action
    ) =>
        new(
            state.SessionBlueprint == null
                ? null
                : state.SessionBlueprint with
                {
                    Exercises = state.SessionBlueprint.Exercises.Add(action.ExerciseBlueprint),
                }
        );

    [ReducerMethod]
    public static SessionEditorState RemoveExerciseAction(
        SessionEditorState state,
        RemoveExerciseAction action
    ) =>
        new(
            state.SessionBlueprint == null
                ? null
                : state.SessionBlueprint with
                {
                    Exercises = state.SessionBlueprint.Exercises.Remove(action.ExerciseBlueprint),
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
                Exercises = state
                    .SessionBlueprint.Exercises.SetItem(index, toSwap)
                    .SetItem(index - 1, action.ExerciseBlueprint),
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
                Exercises = state
                    .SessionBlueprint.Exercises.SetItem(index, toSwap)
                    .SetItem(index + 1, action.ExerciseBlueprint),
            }
        );
    }

    [ReducerMethod]
    public static SessionEditorState UpdateSessionExercise(
        SessionEditorState state,
        UpdateSessionExerciseAction action
    ) => UpdateExerciseIfCan(state, action.ExerciseIndex, blueprint => action.ExerciseBlueprint);

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
