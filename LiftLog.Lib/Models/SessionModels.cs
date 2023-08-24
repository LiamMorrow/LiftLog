namespace LiftLog.Lib.Models;

public record Session(
    Guid Id,
    SessionBlueprint Blueprint,
    ImmutableListValue<RecordedExercise> RecordedExercises,
    DateOnly Date
)
{
    public RecordedExercise? NextExercise
        => RecordedExercises
            .Where(x => x.RecordedSets.Any(set => set is null))
            .OrderByDescending(x => x.LastRecordedSet?.CompletionTime)
            .FirstOrDefault();

    public RecordedExercise? LastExercise
        => RecordedExercises
            .Where(x => x.RecordedSets.Any(set => set is not null))
            .OrderByDescending(x => x.LastRecordedSet?.CompletionTime)
            .FirstOrDefault();

    public bool IsStarted => RecordedExercises.Any(x => x.LastRecordedSet is not null);

    public bool IsComplete => RecordedExercises.All(x => x.RecordedSets.All(set => set is not null));

    public decimal TotalKilogramsLifted => RecordedExercises
        .Sum(ex => ex.Kilograms * ex.RecordedSets.Sum(set => set?.RepsCompleted ?? 0));
}

public record RecordedExercise(
    ExerciseBlueprint Blueprint,
    decimal Kilograms,
    ImmutableListValue<RecordedSet?> RecordedSets
)
{
    public bool SucceededAllSets =>
        RecordedSets.All(x => x is not null && x.RepsCompleted == Blueprint.RepsPerSet);

    public RecordedSet? LastRecordedSet => RecordedSets
        .OrderByDescending(x => x?.CompletionTime)
        .FirstOrDefault(x => x is not null);
}

public record RecordedSet(int RepsCompleted, DateTimeOffset CompletionTime);
