using System.Collections.Immutable;

namespace LiftLog.Lib.Models;

public record ProgramBlueprint(
    string Name,
    ImmutableList<SessionBlueprint> Sessions,
    DateOnly LastEdited
);

public record SessionBlueprint(
    string Name,
    ImmutableList<ExerciseBlueprint> Exercises,
    string Notes
);

public record ExerciseBlueprint(
    string Name,
    int Sets,
    int RepsPerSet,
    decimal WeightIncreaseOnSuccess,
    Rest RestBetweenSets,
    bool SupersetWithNext,
    string Notes,
    string Link
);

public record Rest(TimeSpan MinRest, TimeSpan MaxRest, TimeSpan FailureRest);
