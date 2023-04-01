namespace LiftLog.Lib.Models;

public record Session(
    Guid Id,
    ImmutableListSequence<RecordedExercise> RecordedExercises,
    DateTimeOffset Date
);

public record RecordedExercise(
    decimal Weight,
    ImmutableListSequence<RecordedSet?> RecordedSets,
    bool SucceededAllSets
)
{
    public RecordedSet? LastRecordedSet => RecordedSets.LastOrDefault(x => x is not null);
}

public record RecordedSet(int RepsCompleted, DateTimeOffset CompletionTime);
