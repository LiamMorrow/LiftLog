using System;
using System.Collections.Immutable;

namespace SimpleGymTracker.Lib.Models
{
  public record WorkoutWeightedExercise(WorkoutPlanWeightedExercise PlanExercise, ImmutableListSequence<int?> SetRepCounts, decimal Weight)
  {
    public WorkoutWeightedExercise WithCycledRepCount(int repCountIndex)
    {
      var repCounts = SetRepCounts;
      var repCount = repCounts[repCountIndex] switch
      {
        null => PlanExercise.RepsPerSet,
        0 => (int?)null,
        int reps => reps - 1
      };

      repCounts = repCounts.SetItem(repCountIndex, repCount);

      return this with
      {
        SetRepCounts = repCounts
      };
    }
  }

  public record WorkoutDay(WorkoutPlan Plan, WorkoutPlanDay PlanDay, ImmutableListSequence<WorkoutWeightedExercise> WeightedExercises);

  public record WorkoutProgress(ImmutableDictionary<WorkoutPlanWeightedExercise, decimal> ExerciseWeights);
}
