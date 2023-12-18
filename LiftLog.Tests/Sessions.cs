using LiftLog.Lib.Models;

namespace LiftLog.Tests;

public static class Sessions
{
    public static Session CreateSession(
        SessionBlueprint? sessionBlueprint = null,
        Func<Session, Session>? transform = null
    )
    {
        sessionBlueprint ??= Blueprints.CreateSessionBlueprint();
        return (transform ?? (s => s)).Invoke(
            new Session(
                Id: Guid.NewGuid(),
                Blueprint: sessionBlueprint,
                RecordedExercises: sessionBlueprint
                    .Exercises.Select(x => CreateRecordedExercise(x))
                    .ToImmutableList(),
                Date: DateOnly.Parse("2021-04-05"),
                Bodyweight: null
            )
        );
    }

    public static RecordedExercise CreateRecordedExercise(
        ExerciseBlueprint? exerciseBlueprint = null,
        Func<RecordedExercise, RecordedExercise>? transform = null
    )
    {
        exerciseBlueprint ??= Blueprints.CreateExerciseBlueprint();
        return (transform ?? (e => e)).Invoke(
            new RecordedExercise(
                Blueprint: exerciseBlueprint,
                Weight: exerciseBlueprint.InitialWeight,
                PotentialSets: Enumerable
                    .Range(0, exerciseBlueprint.Sets)
                    .Select(
                        (i) =>
                            i switch
                            {
                                0
                                    => new PotentialSet(
                                        new(
                                            RepsCompleted: exerciseBlueprint.RepsPerSet,
                                            CompletionTime: TimeOnly.Parse("14:32:00")
                                        ),
                                        exerciseBlueprint.InitialWeight
                                    ),
                                _ => new PotentialSet(null, exerciseBlueprint.InitialWeight)
                            }
                    )
                    .ToImmutableList(),
                Notes: null,
                PerSetWeight: false
            )
        );
    }

    public static PotentialSet CreatePotentialSet(
        decimal weight,
        int repsCompleted = 10,
        bool isEmpty = false
    )
    {
        return isEmpty
            ? new PotentialSet(null, weight)
            : new PotentialSet(
                new(RepsCompleted: repsCompleted, CompletionTime: TimeOnly.Parse("14:32:00")),
                weight
            );
    }
}
