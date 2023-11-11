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
                RecordedExercises: sessionBlueprint.Exercises
                    .Select(x => CreateRecordedExercise(x))
                    .ToImmutableList(),
                Date: DateOnly.Parse("2021-04-05")
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
                Kilograms: exerciseBlueprint.InitialKilograms,
                RecordedSets: Enumerable
                    .Range(0, exerciseBlueprint.Sets)
                    .Select(
                        (i) =>
                            i switch
                            {
                                0
                                    => new RecordedSet(
                                        RepsCompleted: exerciseBlueprint.RepsPerSet,
                                        CompletionTime: DateTime.Parse("2021-04-05T14:32:00")
                                    ),
                                _ => null
                            }
                    )
                    .ToImmutableList()
            )
        );
    }
}
