using System;
using System.Collections.Immutable;

namespace SimpleGymTracker.Lib.Models
{
  public record WorkoutWeightedExercise(WorkoutPlanWeightedExercise PlanExercise, ImmutableList<int> SetRepCounts, decimal Weight);
  
  public record WorkoutDay(WorkoutPlan Plan, WorkoutPlanDay PlanDay, ImmutableList<WorkoutWeightedExercise> WeightedExercises);

  public record WorkoutProgress(ImmutableDictionary<WorkoutPlanWeightedExercise, decimal> ExerciseWeights);
}
