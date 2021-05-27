using System;
using System.Collections.Immutable;

namespace SimpleGymTracker.Lib.Models
{
  public record Rest(int MinRest, int SecondaryRest, int FailureRest);

  public record WorkoutPlanWeightedExercise(string Name, int Sets, int RepsPerSet, decimal KilogramsIncreaseOnSuccess, Rest RestBetweenSets);

  public record WorkoutPlanDay(string Name, ImmutableList<WorkoutPlanWeightedExercise> Groups);

  public record WorkoutPlan(string Name, ImmutableList<WorkoutPlanDay> Days);
}
