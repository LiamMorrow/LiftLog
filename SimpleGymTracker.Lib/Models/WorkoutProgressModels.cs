using System;
using System.Collections.Immutable;
using System.Linq;

namespace SimpleGymTracker.Lib.Models
{
  public record WorkoutWeightedExercise(WorkoutPlanWeightedExercise PlanExercise, ImmutableListSequence<int?> SetRepCounts, decimal Weight, DateTimeOffset? LastSetTime)
  {
    public WorkoutWeightedExercise WithCycledRepCount(int repCountIndex)
    {
      var repCounts = SetRepCounts;
      // We cycle down from the goal sets, or back to null to reset it after 0
      var repCount = repCounts[repCountIndex] switch
      {
        null => PlanExercise.RepsPerSet,
        0 => (int?)null,
        int reps => reps - 1
      };

      repCounts = repCounts.SetItem(repCountIndex, repCount);

      return this with
      {
        SetRepCounts = repCounts,
        LastSetTime = DateTimeOffset.UtcNow
      };
    }
  }

  public record WorkoutDay(
    WorkoutPlan Plan,
    WorkoutPlanDay PlanDay,
    ImmutableListSequence<WorkoutWeightedExercise> WeightedExercises,
    DateTimeOffset Date)
  {
    public WorkoutWeightedExercise? NextExercise
        => WeightedExercises
            .FirstOrDefault(x => x.SetRepCounts.Any(reps => reps is null)
                             && !x.SetRepCounts.All(reps => reps is null));

    public WorkoutWeightedExercise? LastExercise
        => WeightedExercises
            .LastOrDefault(x => x.SetRepCounts.Any(reps => reps is not null)
                            && !x.SetRepCounts.All(reps => reps is not null));
  }

  public record WorkoutDayDao(
    Guid Id,
    WorkoutDay Day);
}
