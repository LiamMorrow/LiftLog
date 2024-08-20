using System.Collections.Immutable;
using Fluxor;
using LiftLog.Lib.Models;
using LiftLog.Ui.Store.Exercises;

namespace LiftLog.Ui.Store.Exercises;

public static class ExercisesReducers
{
    [ReducerMethod]
    public static ExercisesState ReduceSetDescribedExercisesAction(
        ExercisesState state,
        SetDescribedExercisesAction action
    ) =>
        state with
        {
            DescribedExercises = action.DescribedExercises,
            ExerciseNames = action.DescribedExercises.Select(x => x.Name).ToImmutableList(),
        };
}
