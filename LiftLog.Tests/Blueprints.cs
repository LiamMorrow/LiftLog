using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.Tests;

public static class Blueprints
{
    public static ExerciseBlueprint CreateExerciseBlueprint(
        Func<ExerciseBlueprint, ExerciseBlueprint>? transform = null
    )
    {
        return (transform ?? (e => e)).Invoke(
            new ExerciseBlueprint(
                Name: "Test Exercise",
                Sets: 3,
                RepsPerSet: 10,
                InitialWeight: 20,
                WeightIncreaseOnSuccess: 2.5m,
                RestBetweenSets: Rest.Medium,
                SupersetWithNext: false
            )
        );
    }

    public static SessionBlueprint CreateSessionBlueprint()
    {
        return new SessionBlueprint(
            Name: "Test Session",
            Exercises: [
                CreateExerciseBlueprint(),
                CreateExerciseBlueprint(e => e with { Name = "Test Exercise 2", RepsPerSet = 4 }),
                CreateExerciseBlueprint(e => e with { Name = "Test Exercise 3", Sets = 4 })
            ]
        );
    }
}
