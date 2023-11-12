namespace LiftLog.Lib.Models;

public record Session(
    Guid Id,
    SessionBlueprint Blueprint,
    ImmutableListValue<RecordedExercise> RecordedExercises,
    DateOnly Date
)
{
    public RecordedExercise? NextExercise
    {
        get
        {
            var latestExerciseIndex = RecordedExercises
                .IndexedTuples()
                .Where(x => x.Item.LastRecordedSet is not null)
                .OrderByDescending(x => x.Item.LastRecordedSet?.CompletionTime)
                .Select(x => x.Index)
                .FirstOrDefault(-1);
            var latestExerciseSupersetsWithNext = latestExerciseIndex switch
            {
                -1 => false, // Not found
                var i when i == RecordedExercises.Count - 1 => false, // Cant superset next on last
                var i => RecordedExercises[i].Blueprint.SupersetWithNext
            };
            var latestExerciseSupersetsWithPrevious = latestExerciseIndex switch
            {
                -1 or 0 => false, // Not found or first
                var i => RecordedExercises[i - 1].Blueprint.SupersetWithNext
            };
            if (
                latestExerciseSupersetsWithNext
                && RecordedExercises[latestExerciseIndex + 1].HasRemainingSets
            )
            {
                return RecordedExercises[latestExerciseIndex + 1];
            }
            if (
                latestExerciseSupersetsWithPrevious
                && RecordedExercises[latestExerciseIndex - 1].HasRemainingSets
            )
            {
                return RecordedExercises[latestExerciseIndex - 1];
            }
            return RecordedExercises
                .Where(x => x.HasRemainingSets)
                .OrderByDescending(x => x.LastRecordedSet?.CompletionTime)
                .FirstOrDefault();
        }
    }

    public RecordedExercise? LastExercise =>
        RecordedExercises
            .Where(x => x.RecordedSets.Any(set => set is not null))
            .OrderByDescending(x => x.LastRecordedSet?.CompletionTime)
            .FirstOrDefault();

    public bool IsStarted => RecordedExercises.Any(x => x.LastRecordedSet is not null);

    public bool IsComplete =>
        RecordedExercises.All(x => x.RecordedSets.All(set => set is not null));

    public decimal TotalKilogramsLifted =>
        RecordedExercises.Sum(
            ex => ex.Kilograms * ex.RecordedSets.Sum(set => set?.RepsCompleted ?? 0)
        );
}

public record RecordedExercise(
    ExerciseBlueprint Blueprint,
    decimal Kilograms,
    ImmutableListValue<RecordedSet?> RecordedSets
)
{
    public bool SucceededAllSets =>
        RecordedSets.All(x => x is not null && x.RepsCompleted == Blueprint.RepsPerSet);

    public RecordedSet? LastRecordedSet =>
        RecordedSets.OrderByDescending(x => x?.CompletionTime).FirstOrDefault(x => x is not null);

    public decimal OneRepMax =>
        Math.Floor(Kilograms / (1.0278m - (0.0278m * Blueprint.RepsPerSet)));

    public bool HasRemainingSets => RecordedSets.Any(x => x is null);
}

public record RecordedSet(int RepsCompleted, TimeOnly CompletionTime);
