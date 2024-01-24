using System.Collections.Immutable;

namespace LiftLog.Lib.Models;

public record Session(
    Guid Id,
    SessionBlueprint Blueprint,
    ImmutableListValue<RecordedExercise> RecordedExercises,
    DateOnly Date,
    decimal? Bodyweight
)
{
    public RecordedExercise? NextExercise
    {
        get
        {
            var latestExerciseIndex = RecordedExercises
                .IndexedTuples()
                .Where(x => x.Item.LastRecordedSet is not null)
                .OrderByDescending(x => x.Item.LastRecordedSet?.Set?.CompletionTime)
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
                .OrderByDescending(x => x.LastRecordedSet?.Set?.CompletionTime)
                .FirstOrDefault();
        }
    }

    public RecordedExercise? LastExercise =>
        RecordedExercises
            .Where(x => x.PotentialSets.Any(set => set.Set is not null))
            .OrderByDescending(x => x.LastRecordedSet?.Set?.CompletionTime)
            .FirstOrDefault();

    public bool IsStarted => RecordedExercises.Any(x => x.LastRecordedSet?.Set is not null);

    public bool IsComplete =>
        RecordedExercises.All(x => x.PotentialSets.All(set => set.Set is not null));

    public decimal TotalWeightLifted =>
        RecordedExercises.Sum(ex =>
            ex.PotentialSets.Sum(set => (set.Set?.RepsCompleted ?? 0) * set.Weight)
        );
}

public record RecordedExercise(
    ExerciseBlueprint Blueprint,
    decimal Weight,
    ImmutableListValue<PotentialSet> PotentialSets,
    string? Notes,
    bool PerSetWeight
)
{
    /// <summary>
    /// An exercise is considered a success if ALL sets are successful, with ANY of the sets >= the top level weight
    /// </summary>
    public bool IsSuccessForProgressiveOverload =>
        PotentialSets.All(x => x.Set is not null && x.Set.RepsCompleted >= Blueprint.RepsPerSet)
        && PotentialSets.Any(x => x.Weight >= Weight);

    public PotentialSet? LastRecordedSet =>
        PotentialSets
            .OrderByDescending(x => x.Set?.CompletionTime)
            .FirstOrDefault(x => x.Set is not null);

    public decimal OneRepMax => Math.Floor(Weight / (1.0278m - (0.0278m * Blueprint.RepsPerSet)));

    public bool HasRemainingSets => PotentialSets.Any(x => x.Set is null);
}

public record RecordedSet(int RepsCompleted, TimeOnly CompletionTime);

public record PotentialSet(RecordedSet? Set, decimal Weight);
