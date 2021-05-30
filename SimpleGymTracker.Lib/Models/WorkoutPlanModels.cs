using System;
using System.Collections.Immutable;
using System.Linq;
using static SimpleGymTracker.Lib.Util;

namespace SimpleGymTracker.Lib.Models
{
  public record Rest(int MinRest, int SecondaryRest, int FailureRest);

  public record WorkoutPlanWeightedExercise(string Name, int Sets, int RepsPerSet, decimal InitialKilograms, decimal KilogramsIncreaseOnSuccess, Rest RestBetweenSets);

  public record WorkoutPlanDay(string Name, ImmutableListSequence<WorkoutPlanWeightedExercise> Groups);

  public record WorkoutPlan(string Name, ImmutableListSequence<WorkoutPlanDay> Days)
  {
    public WorkoutDay FirstDay()
      => new WorkoutDay(
          this,
          Days[0],
          ListOf(Days[0].Groups
            .Select(x => new WorkoutWeightedExercise(
                          x, ListOf(Enumerable.Repeat<int?>(null, x.Sets)), x.InitialKilograms))));
  }
}
