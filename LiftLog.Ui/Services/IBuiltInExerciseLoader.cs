namespace LiftLog.Ui.Services;

public record DescribedExercise(
    string Name,
    string? Force,
    string? Level,
    string? Mechanic,
    string? Equipment,
    string[]? PrimaryMuscles,
    string[]? SecondaryMuscles,
    string[]? Instructions,
    string? Category
)
{
    public static DescribedExercise FromName(string name) =>
        new(name, null, null, null, null, null, null, null, null);
}

public interface IBuiltInExerciseLoader
{
    Task<IReadOnlyList<DescribedExercise>> LoadBuiltInExercisesAsync();
}
