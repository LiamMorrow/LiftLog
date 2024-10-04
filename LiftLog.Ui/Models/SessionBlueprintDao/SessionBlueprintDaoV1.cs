using System.Collections.Immutable;
using System.Text.Json.Serialization;
using LiftLog.Lib;

namespace LiftLog.Ui.Models.SessionBlueprintDao;

internal record SessionBlueprintContainerDaoV1(
    [property: JsonPropertyName("SessionBlueprints")]
        ImmutableListValue<SessionBlueprintDaoV1> SessionBlueprints
)
{
    public static SessionBlueprintContainerDaoV1 FromModel(
        ImmutableListValue<Lib.Models.SessionBlueprint> model
    ) => new(model.Select(SessionBlueprintDaoV1.FromModel).ToImmutableList());

    public ImmutableListValue<Lib.Models.SessionBlueprint> ToModel() =>
        SessionBlueprints.Select(x => x.ToModel()).ToImmutableList();
}

internal record SessionBlueprintDaoV1(
    [property: JsonPropertyName("Name")] string Name,
    [property: JsonPropertyName("Exercises")] ImmutableListValue<ExerciseBlueprintDaoV1> Exercises,
    [property: JsonPropertyName("Notes")] string? Notes
)
{
    internal static SessionBlueprintDaoV1 FromModel(Lib.Models.SessionBlueprint blueprint) =>
        new(
            blueprint.Name,
            blueprint.Exercises.Select(ExerciseBlueprintDaoV1.FromModel).ToImmutableList(),
            blueprint.Notes
        );

    internal Lib.Models.SessionBlueprint ToModel() =>
        new(Name, Exercises.Select(x => x.ToModel()).ToImmutableList(), Notes ?? "");
}

internal record ExerciseBlueprintDaoV1(
    [property: JsonPropertyName("Name")] string Name,
    [property: JsonPropertyName("Sets")] int Sets,
    [property: JsonPropertyName("RepsPerSet")] int RepsPerSet,
    [property: JsonPropertyName("InitialKilograms")] decimal InitialKilograms,
    [property: JsonPropertyName("KilogramsIncreaseOnSuccess")] decimal KilogramsIncreaseOnSuccess,
    [property: JsonPropertyName("RestBetweenSets")] RestDaoV1 RestBetweenSets,
    [property: JsonPropertyName("SupersetWithNext")] bool SupersetWithNext,
    [property: JsonPropertyName("Notes")] string? Notes
)
{
    internal static ExerciseBlueprintDaoV1 FromModel(Lib.Models.ExerciseBlueprint blueprint) =>
        new(
            blueprint.Name,
            blueprint.Sets,
            blueprint.RepsPerSet,
            0,
            blueprint.WeightIncreaseOnSuccess,
            RestDaoV1.FromModel(blueprint.RestBetweenSets),
            blueprint.SupersetWithNext,
            blueprint.Notes
        );

    internal Lib.Models.ExerciseBlueprint ToModel() =>
        new(
            Name,
            Sets,
            RepsPerSet,
            KilogramsIncreaseOnSuccess,
            RestBetweenSets.ToModel(),
            SupersetWithNext,
            Notes ?? "",
            Link: ""
        );
}

internal record RestDaoV1(
    [property: JsonPropertyName("MinRest")] TimeSpan MinRest,
    [property: JsonPropertyName("SecondaryRest")] TimeSpan SecondaryRest,
    [property: JsonPropertyName("FailureRest")] TimeSpan FailureRest
)
{
    internal static RestDaoV1 FromModel(Lib.Models.Rest restBetweenSets) =>
        new(restBetweenSets.MinRest, restBetweenSets.MaxRest, restBetweenSets.FailureRest);

    internal Lib.Models.Rest ToModel() => new(MinRest, SecondaryRest, FailureRest);
}
