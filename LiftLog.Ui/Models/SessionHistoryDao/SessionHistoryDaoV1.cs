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
    public static SessionHistoryDaoV1 FromModel(SessionHistoryDaoContainer model) =>
        new(model.CompletedSessions.Values.Select(SessionDaoV1.FromModel).ToImmutableList());

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
    public static SessionDaoV1 FromModel(Lib.Models.Session model) =>
        new(
            model.Id,
            SessionBlueprintDaoV1.FromModel(model.Blueprint),
            model
                .RecordedExercises.Select(x => RecordedExerciseDaoV1.FromModel(model.Date, x))
                .ToImmutableList(),
            new DateTimeOffset(
                model.Date.Year,
                model.Date.Month,
                model.Date.Day,
                0,
                0,
                0,
                TimeSpan.Zero
            ),
            model.Bodyweight
        );

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
    public static RecordedExerciseDaoV1 FromModel(
        DateOnly sessionDate,
        Lib.Models.RecordedExercise model
    ) =>
        new(
            ExerciseBlueprintDaoV1.FromModel(model.Blueprint),
            model.Weight,
            model
                .PotentialSets.Select(x => RecordedSetDaoV1.FromModel(sessionDate, x))
                .ToImmutableList(),
            model.Notes,
            model.PerSetWeight
        );

    public Lib.Models.RecordedExercise ToModel() =>
        new(
            Blueprint.ToModel(),
            Kilograms,
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
                CompletionTime: sessionDate.ToDateTime(completed.Set.CompletionTime),
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
                    TimeOnly.FromDateTime(completed.CompletionTime.Value.DateTime)
                ),
                weight
            ),
            _ => throw new Exception("Invalid RecordedSetDaoV1"),
        };
    }
}
