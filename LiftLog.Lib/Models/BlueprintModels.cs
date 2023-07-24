using System.Collections.Immutable;

namespace LiftLog.Lib.Models;

public record SessionBlueprint(string Name, ImmutableListSequence<ExerciseBlueprint> Exercises)
{
    public Session GetEmptySession()
    {
        RecordedExercise GetNextExercise(ExerciseBlueprint e)
        {
            return new RecordedExercise(
                e,
                e.InitialKilograms,
                Enumerable.Range(0, e.Sets).Select(_ => (RecordedSet?)null).ToImmutableList()
            );
        }

        return new Session(
            Guid.NewGuid(),
            this,
            Exercises.Select(GetNextExercise).ToImmutableList(),
            DateTimeOffset.Now
        );
    }
}

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
