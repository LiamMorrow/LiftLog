using System.Collections.Immutable;
using Fluxor;
using LiftLog.Ui.Services;

namespace LiftLog.Ui.Store.Exercises;

public class ExercisesEffects(
    IBuiltInExerciseLoader builtInExerciseLoader,
    ProgressRepository progressRepository
)
{
    [EffectMethod]
    public async Task HandleFetchDescribedExercisesAction(
        FetchDescribedExercisesAction _,
        IDispatcher dispatcher
    )
    {
        var (builtInExercises, usedExercises) = await (
            builtInExerciseLoader.LoadBuiltInExercisesAsync(),
            Task.Run(
                async () =>
                    await progressRepository
                        .GetOrderedSessions()
                        .SelectMany(x =>
                            x.RecordedExercises.Select(ex => ex.Blueprint.Name).ToAsyncEnumerable()
                        )
                        .Distinct()
                        .Select(DescribedExercise.FromName)
                        .ToListAsync()
            )
        );

        var describedExercises = builtInExercises
            .Concat(usedExercises)
            .DistinctBy(x => x.Name)
            .ToImmutableList();

        dispatcher.Dispatch(new SetDescribedExercisesAction(describedExercises));
    }
}
