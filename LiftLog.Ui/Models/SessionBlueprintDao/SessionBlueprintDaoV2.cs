using System.Collections.Immutable;
using Google.Protobuf.WellKnownTypes;
using LiftLog.Lib;

namespace LiftLog.Ui.Models.SessionBlueprintDao;

internal partial class SessionBlueprintContainerDaoV2
{
    public SessionBlueprintContainerDaoV2(IEnumerable<SessionBlueprintDaoV2> sessions)
    {
        SessionBlueprints.AddRange(sessions);
    }

    public static SessionBlueprintContainerDaoV2 FromModel(
        ImmutableList<Lib.Models.SessionBlueprint> model
    ) => new(model.Select(SessionBlueprintDaoV2.FromModel));

    public ImmutableListValue<Lib.Models.SessionBlueprint> ToModel() =>
        SessionBlueprints.Select(x => x.ToModel()).ToImmutableList();
}

internal partial class SessionBlueprintDaoV2
{
    public SessionBlueprintDaoV2(
        string name,
        IEnumerable<ExerciseBlueprintDaoV2> exerciseBlueprints,
        string notes
    )
    {
        Name = name;
        ExerciseBlueprints.AddRange(exerciseBlueprints);
        Notes = notes;
    }

    public static SessionBlueprintDaoV2 FromModel(Lib.Models.SessionBlueprint model) =>
        new(
            model.Name,
            model.Exercises.Select(ExerciseBlueprintDaoV2.FromModel).ToImmutableList(),
            model.Notes
        );

    public Lib.Models.SessionBlueprint ToModel() =>
        new(Name, ExerciseBlueprints.Select(x => x.ToModel()).ToImmutableList(), Notes);
}

internal partial class ExerciseBlueprintDaoV2
{
    public ExerciseBlueprintDaoV2(
        string name,
        int sets,
        int repsPerSet,
        DecimalValue weightIncreaseOnSuccess,
        RestDaoV2 restBetweenSets,
        bool supersetWithNext,
        string notes
    )
    {
        Name = name;
        Sets = sets;
        RepsPerSet = repsPerSet;
        WeightIncreaseOnSuccess = weightIncreaseOnSuccess;
        RestBetweenSets = restBetweenSets;
        SupersetWithNext = supersetWithNext;
        Notes = notes;
    }

    public static ExerciseBlueprintDaoV2 FromModel(Lib.Models.ExerciseBlueprint model) =>
        new(
            model.Name,
            model.Sets,
            model.RepsPerSet,
            model.WeightIncreaseOnSuccess,
            RestDaoV2.FromModel(model.RestBetweenSets),
            model.SupersetWithNext,
            model.Notes
        );

    public Lib.Models.ExerciseBlueprint ToModel() =>
        new(
            Name,
            Sets,
            RepsPerSet,
            WeightIncreaseOnSuccess,
            RestBetweenSets.ToModel(),
            SupersetWithNext,
            Notes
        );
}

internal partial class RestDaoV2
{
    public RestDaoV2(Duration minRest, Duration maxRest, Duration failureRest)
    {
        MinRest = minRest;
        MaxRest = maxRest;
        FailureRest = failureRest;
    }

    public static RestDaoV2 FromModel(Lib.Models.Rest model) =>
        new(
            Duration.FromTimeSpan(model.MinRest),
            Duration.FromTimeSpan(model.MaxRest),
            Duration.FromTimeSpan(model.FailureRest)
        );

    public Lib.Models.Rest ToModel() =>
        new(MinRest.ToTimeSpan(), MaxRest.ToTimeSpan(), FailureRest.ToTimeSpan());
}
