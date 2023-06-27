namespace LiftLog.Lib.Models;

public record SessionBlueprint(string Name, ImmutableListSequence<ExerciseBlueprint> Exercises);

public record ExerciseBlueprint(
    string Name,
    int Sets,
    int RepsPerSet,
    decimal InitialKilograms,
    decimal KilogramsIncreaseOnSuccess,
    Rest RestBetweenSets
)
{
    public virtual bool Equals(ExerciseBlueprint? other)
    {
        if (other is null) return false;
        if (ReferenceEquals(this, other)) return true;
        return Name == other.Name && Sets == other.Sets && RepsPerSet == other.RepsPerSet;
    }

    public override int GetHashCode()
    {
        return HashCode.Combine(Name, Sets, RepsPerSet);
    }
}

public record Rest(TimeSpan MinRest, TimeSpan MaxRest, TimeSpan FailureRest);
