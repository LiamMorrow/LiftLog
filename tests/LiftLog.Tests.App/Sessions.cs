using LiftLog.Lib.Models;

namespace LiftLog.Tests;

public static class Sessions
{
  public static Session CreateSession(
    SessionBlueprint? sessionBlueprint = null,
    Func<Session, Session>? transform = null,
    int[]? fillSets = null
  )
  {
    sessionBlueprint ??= Blueprints.CreateSessionBlueprint();
    return (transform ?? (s => s)).Invoke(
      new Session(
        Id: Guid.NewGuid(),
        Blueprint: sessionBlueprint,
        RecordedExercises: sessionBlueprint
          .Exercises.Select((x, i) => CreateRecordedExercise(i, x, fillSets: fillSets))
          .ToImmutableList(),
        Date: DateOnly.Parse("2021-04-05"),
        Bodyweight: null
      )
    );
  }

  public static RecordedExercise CreateRecordedExercise(
    int exerciseIndex,
    ExerciseBlueprint? exerciseBlueprint = null,
    Func<RecordedExercise, RecordedExercise>? transform = null,
    int[]? fillSets = null
  )
  {
    exerciseBlueprint ??= Blueprints.CreateExerciseBlueprint();
    return (transform ?? (e => e)).Invoke(
      new RecordedExercise(
        Blueprint: exerciseBlueprint,
        Weight: 0m,
        PotentialSets: Enumerable
          .Range(0, exerciseBlueprint.Sets)
          .Select(
            (i) =>
              fillSets != null && fillSets.Contains(i)
                ? new PotentialSet(
                  new(
                    RepsCompleted: exerciseBlueprint.RepsPerSet,
                    CompletionTime: TimeOnly.Parse("14:32:00").AddMinutes(exerciseIndex * 5 + i)
                  ),
                  0
                )
                : new PotentialSet(null, 0)
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
