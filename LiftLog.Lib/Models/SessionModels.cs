namespace LiftLog.Lib.Models;

public record Session(
    Guid Id,
    SessionBlueprint Blueprint,
    ImmutableListSequence<RecordedExercise> RecordedExercises,
    DateTimeOffset Date
)
{
    public RecordedExercise? NextExercise =>
        RecordedExercises.FirstOrDefault(
            x => x.RecordedSets.Any(set => set is null) && !x.RecordedSets.All(reps => reps is null)
        );

    public RecordedExercise? LastExercise =>
        RecordedExercises.LastOrDefault(
            x =>
                x.RecordedSets.Any(set => set is not null)
                && !x.RecordedSets.All(reps => reps is not null)
        );
}

public record RecordedExercise(
    ExerciseBlueprint Blueprint,
    decimal Kilograms,
    ImmutableListSequence<RecordedSet?> RecordedSets
)
{
    public bool SucceededAllSets =>
        RecordedSets.All(x => x is not null && x.RepsCompleted == Blueprint.RepsPerSet);

    public RecordedSet? LastRecordedSet => RecordedSets.LastOrDefault(x => x is not null);
}

public record RecordedSet(int RepsCompleted, DateTimeOffset CompletionTime);
