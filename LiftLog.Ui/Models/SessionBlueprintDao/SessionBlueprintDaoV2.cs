using System.Collections.Immutable;
using Google.Protobuf.WellKnownTypes;

namespace LiftLog.Ui.Models.SessionBlueprintDao;

internal partial class SessionBlueprintDaoV2
{
    public SessionBlueprintDaoV2(
        string name,
        IEnumerable<ExerciseBlueprintDaoV2> exerciseBlueprints
    )
    {
        Name = name;
        ExerciseBlueprints.AddRange(exerciseBlueprints);
    }

    public static SessionBlueprintDaoV2 FromModel(Lib.Models.SessionBlueprint model) =>
        new(model.Name, model.Exercises.Select(ExerciseBlueprintDaoV2.FromModel).ToImmutableList());

    public Lib.Models.SessionBlueprint ToModel() =>
        new(Name, ExerciseBlueprints.Select(x => x.ToModel()).ToImmutableList());
}

internal partial class ExerciseBlueprintDaoV2
{
    public ExerciseBlueprintDaoV2(
        string name,
        int sets,
        int repsPerSet,
        DecimalValue initialWeight,
        DecimalValue weightIncreaseOnSuccess,
        RestDaoV2 restBetweenSets,
        bool supersetWithNext
    )
    {
        Name = name;
        Sets = sets;
        RepsPerSet = repsPerSet;
        InitialWeight = initialWeight;
        WeightIncreaseOnSuccess = weightIncreaseOnSuccess;
        RestBetweenSets = restBetweenSets;
        SupersetWithNext = supersetWithNext;
    }

    public static ExerciseBlueprintDaoV2 FromModel(Lib.Models.ExerciseBlueprint model) =>
        new(
            model.Name,
            model.Sets,
            model.RepsPerSet,
            model.InitialWeight,
            model.WeightIncreaseOnSuccess,
            RestDaoV2.FromModel(model.RestBetweenSets),
            model.SupersetWithNext
        );

    public Lib.Models.ExerciseBlueprint ToModel() =>
        new(
            Name,
            Sets,
            RepsPerSet,
            InitialWeight,
            WeightIncreaseOnSuccess,
            RestBetweenSets.ToModel(),
            SupersetWithNext
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
