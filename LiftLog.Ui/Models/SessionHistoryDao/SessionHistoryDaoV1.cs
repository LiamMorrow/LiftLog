using System.Collections.Immutable;
using System.Text.Json.Serialization;
using LiftLog.Lib;
using LiftLog.Ui.Models.SessionBlueprintDao;

namespace LiftLog.Ui.Models.SessionHistoryDao;

internal record SessionHistoryDaoV1(

    [property: JsonPropertyName("CurrentSession")]
    SessionDaoV1? CurrentSession,
    [property: JsonPropertyName("CompletedSessions")]
    ImmutableListSequence<SessionDaoV1> CompletedSessions
)
{
    public static SessionHistoryDaoV1 FromModel(SessionHistoryDaoContainer model)
        => new(
            model.CurrentSession is null ? null : SessionDaoV1.FromModel(model.CurrentSession),
            model.CompletedSessions.Select(SessionDaoV1.FromModel).ToImmutableList()
        );

    public SessionHistoryDaoContainer ToModel()
        => new(
            CurrentSession?.ToModel(),
            CompletedSessions.Select(x => x.ToModel()).ToImmutableList()
        );
}

internal record SessionDaoV1(

    [property: JsonPropertyName("Id")]
    Guid Id,
    [property: JsonPropertyName("Blueprint")]
    SessionBlueprintDaoV1 Blueprint,
    [property: JsonPropertyName("RecordedExercises")]
    ImmutableListSequence<RecordedExerciseDaoV1> RecordedExercises,
    [property: JsonPropertyName("Date")]
    DateTimeOffset Date
)
{
    public static SessionDaoV1 FromModel(Lib.Models.Session model)
        => new(
            model.Id,
            SessionBlueprintDaoV1.FromModel(model.Blueprint),
            model.RecordedExercises.Select(RecordedExerciseDaoV1.FromModel).ToImmutableList(),
            model.Date
        );

    public Lib.Models.Session ToModel()
        => new(
            Id,
            Blueprint.ToModel(),
            RecordedExercises.Select(x => x.ToModel()).ToImmutableList(),
            Date
        );
}

internal record RecordedExerciseDaoV1(

    [property: JsonPropertyName("Blueprint")]
    ExerciseBlueprintDaoV1 Blueprint,
    [property: JsonPropertyName("Kilograms")]
    decimal Kilograms,
    [property: JsonPropertyName("RecordedSets")]
    ImmutableListSequence<RecordedSetDaoV1?> RecordedSets
)
{
    public static RecordedExerciseDaoV1 FromModel(Lib.Models.RecordedExercise model)
        => new(
            ExerciseBlueprintDaoV1.FromModel(model.Blueprint),
            model.Kilograms,
            model.RecordedSets.Select(RecordedSetDaoV1.FromModel).ToImmutableList()
        );

    public Lib.Models.RecordedExercise ToModel()
        => new(
            Blueprint.ToModel(),
            Kilograms,
            RecordedSets.Select(x => x?.ToModel()).ToImmutableList()
        );
}

internal record RecordedSetDaoV1(

    [property: JsonPropertyName("RepsCompleted")]
    int RepsCompleted,
    [property: JsonPropertyName("CompletionTime")]
    DateTimeOffset CompletionTime
)
{
    public static RecordedSetDaoV1? FromModel(Lib.Models.RecordedSet? model)
        => model is null
            ? null
            : new RecordedSetDaoV1(model.RepsCompleted, model.CompletionTime);

    public Lib.Models.RecordedSet? ToModel()
        => RepsCompleted == 0
            ? null
            : new Lib.Models.RecordedSet(RepsCompleted, CompletionTime);
}