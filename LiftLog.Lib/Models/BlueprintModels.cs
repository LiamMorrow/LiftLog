using System.Collections.Immutable;

namespace LiftLog.Lib.Models;

public record SessionBlueprint(string Name, ImmutableListValue<ExerciseBlueprint> Exercises)
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

public record Rest(TimeSpan MinRest, TimeSpan MaxRest, TimeSpan FailureRest)
{
    public static readonly Rest Short = new(TimeSpan.FromSeconds(60), TimeSpan.FromSeconds(90), TimeSpan.FromSeconds(180));
    public static readonly Rest Medium = new(TimeSpan.FromSeconds(90), TimeSpan.FromSeconds(180), TimeSpan.FromSeconds(300));
    public static readonly Rest Long = new(TimeSpan.FromMinutes(3), TimeSpan.FromMinutes(5), TimeSpan.FromMinutes(8));

    public bool IsCustom => this != Short && this != Medium && this != Long;
}
