namespace LiftLog.Lib.Models
{
    public record SessionBlueprint(string Name, ImmutableListSequence<ExerciseBlueprint> Exercises);

    public record ExerciseBlueprint(
        string Name,
        int Sets,
        int RepsPerSet,
        decimal InitialKilograms,
        decimal KilogramsIncreaseOnSuccess,
        Rest RestBetweenSets
    );

    public record Rest(TimeSpan MinRest, TimeSpan SecondaryRest, TimeSpan FailureRest);
}
