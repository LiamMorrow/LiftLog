using System;
using System.Collections.Immutable;
using System.Linq;
using static SimpleGymTracker.Lib.Util;

namespace SimpleGymTracker.Lib.Models
{
  public record Rest(int MinRest, int SecondaryRest, int FailureRest);

  public record WorkoutPlanWeightedExercise(string Name, int Sets, int RepsPerSet, decimal InitialKilograms, decimal KilogramsIncreaseOnSuccess, Rest RestBetweenSets);

  public record WorkoutPlanDay(string Name, ImmutableList<WorkoutPlanWeightedExercise> Groups);

  public record WorkoutPlan(string Name, ImmutableList<WorkoutPlanDay> Days)
  {
    public WorkoutDay FirstDay()
      => new WorkoutDay(
          this, 
          Days[0], 
          Days[0].Groups
            .Select(x => new WorkoutWeightedExercise(
                          x, ListOf(Enumerable.Repeat<int?>(null, x.Sets)), x.InitialKilograms))
            .ToImmutableList());
  }
}
