using System.Collections.Immutable;
using LiftLog.Ui.Models.SessionBlueprintDao;

namespace LiftLog.Ui.Models.SessionHistoryDao;

internal partial class SessionHistoryDaoV2
{
    public SessionHistoryDaoV2(IEnumerable<SessionDaoV2> completedSessions)
    {
        CompletedSessions.AddRange(completedSessions);
    }

    public static SessionHistoryDaoV2 FromModel(SessionHistoryDaoContainer model) =>
        new(model.CompletedSessions.Values.Select(SessionDaoV2.FromModel));

    public SessionHistoryDaoContainer ToModel() =>
        new(CompletedSessions.Select(x => x.ToModel()).ToImmutableDictionary(x => x.Id, x => x));
}

internal partial class SessionDaoV2
{
    public SessionDaoV2(
        UuidDao id,
        SessionBlueprintDaoV2 sessionBlueprint,
        IEnumerable<RecordedExerciseDaoV2> recordedExercises,
        DateOnlyDao date,
        decimal? bodyweight,
        string blueprintNotes
    )
    {
        Id = id;
        RecordedExercises.AddRange(recordedExercises);
        Date = date;
        Bodyweight = bodyweight;
        SessionName = sessionBlueprint.Name;
        BlueprintNotes = blueprintNotes;
    }

    public static SessionDaoV2 FromModel(Lib.Models.Session model) =>
        new(
            model.Id,
            SessionBlueprintDaoV2.FromModel(model.Blueprint),
            model.RecordedExercises.Select(RecordedExerciseDaoV2.FromModel).ToImmutableList(),
            model.Date,
            model.Bodyweight,
            model.Blueprint.Notes
        );

    public Lib.Models.Session ToModel() =>
        new(
            Id,
            new Lib.Models.SessionBlueprint(
                SessionName,
                RecordedExercises.Select(x => x.ToModel().Blueprint).ToImmutableList(),
                BlueprintNotes
            ),
            RecordedExercises.Select(x => x.ToModel()).ToImmutableList(),
            Date,
            Bodyweight
        );
}

internal partial class RecordedExerciseDaoV2
{
    public RecordedExerciseDaoV2(
        ExerciseBlueprintDaoV2 exerciseBlueprint,
        decimal? weight,
        IEnumerable<PotentialSetDaoV2> potentialSets,
        string? notes,
        bool perSetWeight
    )
    {
        ExerciseBlueprint = exerciseBlueprint;
        Weight = weight;
        PotentialSets.AddRange(potentialSets);
        Notes = notes;
        PerSetWeight = perSetWeight;
    }

    public static RecordedExerciseDaoV2 FromModel(Lib.Models.RecordedExercise model) =>
        new(
            ExerciseBlueprintDaoV2.FromModel(model.Blueprint),
            null,
            model.PotentialSets.Select(PotentialSetDaoV2.FromModel),
            model.Notes,
            model.PerSetWeight
        );

    public Lib.Models.RecordedExercise ToModel() =>
        new(
            ExerciseBlueprint.ToModel(),
            PotentialSets.Select(x => x.ToModel()).ToImmutableList(),
            Notes,
            PerSetWeight
        );
}

internal partial class PotentialSetDaoV2
{
    public PotentialSetDaoV2(RecordedSetDaoV2? recordedSet, decimal weight)
    {
        RecordedSet = recordedSet;
        Weight = weight;
    }

    public static PotentialSetDaoV2 FromModel(Lib.Models.PotentialSet model) =>
        new(RecordedSetDaoV2.FromModel(model.Set), model.Weight);

    public Lib.Models.PotentialSet ToModel() => new(RecordedSet?.ToModel(), Weight);
}

internal partial class RecordedSetDaoV2
{
    public RecordedSetDaoV2(int repsCompleted, TimeOnlyDao completionTime)
    {
        RepsCompleted = repsCompleted;
        CompletionTime = completionTime;
    }

    public static RecordedSetDaoV2? FromModel(Lib.Models.RecordedSet? model) =>
        model is null ? null : new(model.RepsCompleted, model.CompletionTime);

    public Lib.Models.RecordedSet ToModel() => new(RepsCompleted, CompletionTime);
}
