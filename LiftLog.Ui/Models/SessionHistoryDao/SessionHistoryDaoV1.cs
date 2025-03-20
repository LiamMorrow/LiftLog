using System.Collections.Immutable;
using System.Text.Json.Serialization;
using LiftLog.Lib;
using LiftLog.Ui.Models.SessionBlueprintDao;

namespace LiftLog.Ui.Models.SessionHistoryDao;

internal record SessionHistoryDaoV1(
    [property: JsonPropertyName("CompletedSessions")]
        ImmutableListValue<SessionDaoV1> CompletedSessions
)
{
    public SessionHistoryDaoContainer ToModel() =>
        new(CompletedSessions.ToImmutableDictionary(x => x.Id, x => x.ToModel()));
}

internal record SessionDaoV1(
    [property: JsonPropertyName("Id")] Guid Id,
    [property: JsonPropertyName("Blueprint")] SessionBlueprintDaoV1 Blueprint,
    [property: JsonPropertyName("RecordedExercises")]
        ImmutableListValue<RecordedExerciseDaoV1> RecordedExercises,
    [property: JsonPropertyName("Date")] DateTimeOffset Date,
    [property: JsonPropertyName("Bodyweight")] decimal? Bodyweight
)
{
    public Lib.Models.Session ToModel() =>
        new(
            Id,
            Blueprint.ToModel(),
            RecordedExercises.Select(x => x.ToModel()).ToImmutableList(),
            new DateOnly(Date.Year, Date.Month, Date.Day),
            Bodyweight
        );
}

internal record RecordedExerciseDaoV1(
    [property: JsonPropertyName("Blueprint")] ExerciseBlueprintDaoV1 Blueprint,
    [property: JsonPropertyName("Kilograms")] decimal Kilograms,
    [property: JsonPropertyName("RecordedSets")] ImmutableListValue<RecordedSetDaoV1?> RecordedSets,
    [property: JsonPropertyName("Notes")] string? Notes,
    [property: JsonPropertyName("PerSetWeight")] bool PerSetWeight
)
{
    public Lib.Models.RecordedExercise ToModel() =>
        new(
            Blueprint.ToModel(),
            RecordedSets
                .Select(x => x?.ToModel(this) ?? new Lib.Models.PotentialSet(null, Kilograms))
                .ToImmutableList(),
            Notes,
            PerSetWeight
        );
}

internal record RecordedSetDaoV1(
    [property: JsonPropertyName("RepsCompleted")] int? RepsCompleted,
    [property: JsonPropertyName("CompletionTime")] DateTimeOffset? CompletionTime,
    [property: JsonPropertyName("Weight")] decimal? Weight
)
{
    public static RecordedSetDaoV1? FromModel(
        DateOnly sessionDate,
        Lib.Models.PotentialSet model
    ) =>
        model switch
        {
            { Set: null } => new RecordedSetDaoV1(
                RepsCompleted: null,
                CompletionTime: null,
                Weight: model.Weight
            ),
            { Set: { } } completed => new RecordedSetDaoV1(
                RepsCompleted: model.Set.RepsCompleted,
                CompletionTime: sessionDate.ToDateTime(
                    completed.Set.CompletionTime,
                    DateTimeKind.Local
                ),
                Weight: completed.Weight
            ),
            _ => null,
        };

    public Lib.Models.PotentialSet ToModel(RecordedExerciseDaoV1 exercise)
    {
        var weight = Weight ?? exercise.Kilograms;
        return this switch
        {
            { RepsCompleted: null, CompletionTime: null } => new Lib.Models.PotentialSet(
                null,
                weight
            ),
            { RepsCompleted: { }, CompletionTime: { } } completed => new Lib.Models.PotentialSet(
                new Lib.Models.RecordedSet(
                    completed.RepsCompleted.Value,
                    DateOnly.FromDateTime(completed.CompletionTime.Value.DateTime),
                    TimeOnly.FromDateTime(completed.CompletionTime.Value.DateTime)
                ),
                weight
            ),
            _ => throw new Exception("Invalid RecordedSetDaoV1"),
        };
    }
}
