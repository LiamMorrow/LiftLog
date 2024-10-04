using System.Collections.Immutable;

namespace LiftLog.Lib.Models;

public record ProgramBlueprint(
    string Name,
    ImmutableListValue<SessionBlueprint> Sessions,
    DateOnly LastEdited
);

public record SessionBlueprint(
    string Name,
    ImmutableListValue<ExerciseBlueprint> Exercises,
    string Notes
)
{
    public static readonly SessionBlueprint Empty = new(string.Empty, [], string.Empty);

    public Session GetEmptySession()
    {
        static RecordedExercise GetNextExercise(ExerciseBlueprint e)
        {
            return new RecordedExercise(
                e,
                0,
                Enumerable.Repeat(new PotentialSet(null, 0), e.Sets).ToImmutableList(),
                null,
                false
            );
        }

        return new Session(
            Guid.NewGuid(),
            this,
            Exercises.Select(GetNextExercise).ToImmutableList(),
            DateOnly.FromDateTime(DateTime.Now),
            null
        );
    }
}

public record ExerciseBlueprint(
    string Name,
    int Sets,
    int RepsPerSet,
    decimal WeightIncreaseOnSuccess,
    Rest RestBetweenSets,
    bool SupersetWithNext,
    string Notes,
    string Link
)
{
    public static readonly ExerciseBlueprint Default =
        new(
            Name: string.Empty,
            Sets: 3,
            RepsPerSet: 8,
            WeightIncreaseOnSuccess: 0,
            RestBetweenSets: Rest.Medium,
            SupersetWithNext: false,
            Notes: string.Empty,
            Link: string.Empty
        );
}

public sealed record KeyedExerciseBlueprint : IEquatable<KeyedExerciseBlueprint>
{
    private readonly string normalizedName = string.Empty;
    public string Name { get; }

    public KeyedExerciseBlueprint(string name)
    {
        Name = name;
        normalizedName = NormalizeName(name);
    }

    public static implicit operator KeyedExerciseBlueprint(ExerciseBlueprint e) => new(e.Name);

    public bool Equals(KeyedExerciseBlueprint? other) => other?.normalizedName == normalizedName;

    public override int GetHashCode() => normalizedName.GetHashCode();

    private static string NormalizeName(string name)
    {
        var lowerName = name.ToLower().Trim().Replace("flies", "flys").Replace("flyes", "flys");
        var withoutPlural = lowerName switch
        {
            string when lowerName.EndsWith("es") => lowerName[..^2],
            string when lowerName.EndsWith('s') => lowerName[..^1],
            _ => lowerName,
        };

        return withoutPlural;
    }
}

public record Rest(TimeSpan MinRest, TimeSpan MaxRest, TimeSpan FailureRest)
{
    public static readonly Rest Short =
        new(TimeSpan.FromSeconds(60), TimeSpan.FromSeconds(90), TimeSpan.FromSeconds(180));

    public static readonly Rest Medium =
        new(TimeSpan.FromSeconds(90), TimeSpan.FromSeconds(180), TimeSpan.FromSeconds(300));

    public static readonly Rest Long =
        new(TimeSpan.FromMinutes(3), TimeSpan.FromMinutes(5), TimeSpan.FromMinutes(8));
}
