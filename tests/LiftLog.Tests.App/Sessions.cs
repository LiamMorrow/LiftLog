using LiftLog.Lib.Models;

namespace LiftLog.Tests;

public static class Sessions
{
  public static Session CreateSession(
    SessionBlueprint? sessionBlueprint = null,
    Func<Session, Session>? transform = null,
    bool fillFirstSet = true
  )
  {
    sessionBlueprint ??= Blueprints.CreateSessionBlueprint();
    return (transform ?? (s => s)).Invoke(
      new Session(
        Id: Guid.NewGuid(),
        Blueprint: sessionBlueprint,
        RecordedExercises: sessionBlueprint
          .Exercises.Select(x => CreateRecordedExercise(x, fillFirstSet: fillFirstSet))
          .ToImmutableList(),
        Date: DateOnly.Parse("2021-04-05"),
        Bodyweight: null
      )
    );
  }

  public static RecordedExercise CreateRecordedExercise(
    ExerciseBlueprint? exerciseBlueprint = null,
    Func<RecordedExercise, RecordedExercise>? transform = null,
    bool fillFirstSet = true
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
              (fillFirstSet, i) switch
              {
                (true, 0)
                  => new PotentialSet(
                    new(
                      RepsCompleted: exerciseBlueprint.RepsPerSet,
                      CompletionTime: TimeOnly.Parse("14:32:00")
                    ),
                    0
                  ),
                _ => new PotentialSet(null, 0)
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
