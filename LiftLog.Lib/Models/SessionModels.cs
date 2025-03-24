using System.Collections.Immutable;
using System.Diagnostics.CodeAnalysis;

namespace LiftLog.Lib.Models;

public record Session(
    Guid Id,
    SessionBlueprint Blueprint,
    ImmutableListValue<RecordedExercise> RecordedExercises,
    DateOnly Date,
    decimal? Bodyweight
)
{
    public static readonly Session Empty = new(
        Guid.Empty,
        SessionBlueprint.Empty,
        [],
        DateOnly.MinValue,
        null
    );

    public static Session FreeformSession(DateOnly date, decimal? bodyweight) =>
        Empty with
        {
            Bodyweight = bodyweight,
            Id = Guid.NewGuid(),
            Blueprint = SessionBlueprint.Empty with { Name = "Freeform Session" },
            Date = date,
        };

    public RecordedExercise? NextExercise
    {
        get
        {
            var latestExerciseIndex = RecordedExercises
                .Index()
                .Where(x => x.Item.LastRecordedSet is not null)
                .OrderByDescending(x => x.Item.LastRecordedSet?.Set?.CompletionTime)
                .Select(x => x.Index)
                .FirstOrDefault(-1);

            var latestExerciseSupersetsWithNext = latestExerciseIndex switch
            {
                -1 => false, // Not found
                var i when i == RecordedExercises.Count - 1 => false, // Cant superset next on last
                var i => RecordedExercises[i].Blueprint.SupersetWithNext,
            };
            var latestExerciseSupersetsWithPrevious = latestExerciseIndex switch
            {
                -1 or 0 => false, // Not found or first
                var i => RecordedExercises[i - 1].Blueprint.SupersetWithNext,
            };
            if (
                latestExerciseSupersetsWithNext
                && RecordedExercises[latestExerciseIndex + 1].HasRemainingSets
            )
            {
                return RecordedExercises[latestExerciseIndex + 1];
            }

            // loop back to the original exercise in the case of a superset chain
            if (latestExerciseSupersetsWithPrevious)
            {
                var indexToJumpBackTo = latestExerciseIndex - 1;
                while (
                    indexToJumpBackTo >= 0
                    && RecordedExercises[indexToJumpBackTo].Blueprint.SupersetWithNext
                )
                {
                    indexToJumpBackTo--;
                }
                // We are now at an exercise which is not supersetting with the next,
                // so jump forward to the next exercise
                indexToJumpBackTo++;
                // Now jump to the first exercise which has remaining sets in the chain
                while (
                    indexToJumpBackTo < RecordedExercises.Count
                    && !RecordedExercises[indexToJumpBackTo].HasRemainingSets
                )
                {
                    indexToJumpBackTo++;
                }

                if (indexToJumpBackTo < RecordedExercises.Count)
                {
                    return RecordedExercises[indexToJumpBackTo];
                }
            }

            return RecordedExercises
                .Where(x => x.HasRemainingSets)
                .MaxBy(x => x.LastRecordedSet?.Set?.CompletionTime);
        }
    }

    public RecordedExercise? LastExercise =>
        RecordedExercises
            .Where(x => x.PotentialSets.Any(set => set.Set is not null))
            .MaxBy(x => x.LastRecordedSet?.Set?.CompletionTime);

    public bool IsStarted => RecordedExercises.Any(x => x.LastRecordedSet?.Set is not null);

    public TimeSpan SessionLength =>
        RecordedExercises
            .Select(x => x.LastRecordedSet?.Set?.CompletionDateTime
            .WhereNotNull()
            .DefaultIfEmpty(DateTime.MinValue)
            .Max()
        - RecordedExercises
            .Select(x => x.FirstRecordedSet?.Set?.CompletionDateTime
            .WhereNotNull()
            .DefaultIfEmpty(DateTime.MinValue)
            .Min();

    public bool IsComplete =>
        RecordedExercises.Any()
        && RecordedExercises.All(x => x.PotentialSets.All(set => set.Set is not null));

    public decimal TotalWeightLifted =>
        RecordedExercises.Sum(ex =>
            ex.PotentialSets.Sum(set => (set.Set?.RepsCompleted ?? 0) * set.Weight)
        );

    public bool IsFreeform => Blueprint.Name == "Freeform Session";
}

public record RecordedExercise(
    ExerciseBlueprint Blueprint,
    ImmutableListValue<PotentialSet> PotentialSets,
    string? Notes,
    bool PerSetWeight
)
{
    /// <summary>
    /// An exercise is considered a success if ALL sets are successful, with ANY of the sets >= the top level weight
    /// </summary>
    public bool IsSuccessForProgressiveOverload =>
        PotentialSets.All(x => x.Set is not null && x.Set.RepsCompleted >= Blueprint.RepsPerSet);

    [NotNullIfNotNull(nameof(FirstRecordedSet))]
    public PotentialSet? LastRecordedSet =>
        PotentialSets
            .OrderByDescending(x => x.Set?.CompletionTime)
            .FirstOrDefault(x => x.Set is not null);

    [NotNullIfNotNull(nameof(LastRecordedSet))]
    public PotentialSet? FirstRecordedSet =>
        PotentialSets.OrderBy(x => x.Set?.CompletionTime).FirstOrDefault(x => x.Set is not null);

    public TimeSpan TimeSpent =>
        (LastRecordedSet?.Set?.CompletionDateTime
        - FirstRecordedSet?.Set?.CompletionDateTime)
        ?? TimeSpan.Zero;

    public decimal OneRepMax =>
        Math.Floor(MaxWeightLifted / (1.0278m - (0.0278m * Blueprint.RepsPerSet)));

    public bool HasRemainingSets => PotentialSets.Any(x => x.Set is null);

    public decimal MaxWeightLifted =>
        PotentialSets.Where(x => x.Set is not null).Select(x => x.Weight).DefaultIfEmpty(0).Max();

    public decimal MaxWeight => PotentialSets.Select(x => x.Weight).DefaultIfEmpty(0).Max();
}

public record RecordedSet(int RepsCompleted, DateOnly CompletionDate, TimeOnly CompletionTime)
{
    public readonly DateTime CompletionDateTime => CompletionDate.ToDateTime(CompletionTime, DateTimeKind.Local);
}

public record PotentialSet(RecordedSet? Set, decimal Weight);
