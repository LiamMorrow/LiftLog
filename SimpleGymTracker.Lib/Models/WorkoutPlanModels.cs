using System;
using System.Collections.Immutable;
using System.Linq;
using static SimpleGymTracker.Lib.Util;

namespace SimpleGymTracker.Lib.Models
{
  public record Rest(TimeSpan MinRest, TimeSpan SecondaryRest, TimeSpan FailureRest);

  public record WorkoutPlanWeightedExercise(string Name, int Sets, int RepsPerSet, decimal InitialKilograms, decimal KilogramsIncreaseOnSuccess, Rest RestBetweenSets);

  public record WorkoutPlanDay(string Name, ImmutableListSequence<WorkoutPlanWeightedExercise> Groups);

  public record WorkoutPlan(string Name, ImmutableListSequence<WorkoutPlanDay> Days)
  {
    public WorkoutDay FirstDay()
      => new(
          this,
          Days[0],
          ListOf(Days[0].Groups
            .Select(plan => new WorkoutWeightedExercise(
                          PlanExercise: plan,
                          Sets: ListOf(Enumerable.Repeat<WorkoutSet?>(null, plan.Sets)),
                          Weight: plan.InitialKilograms))),
          DateTimeOffset.UtcNow);
  }
}
