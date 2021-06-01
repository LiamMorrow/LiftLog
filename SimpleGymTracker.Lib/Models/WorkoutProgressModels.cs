using System;
using System.Collections.Immutable;
using System.Linq;

namespace SimpleGymTracker.Lib.Models
{
  public record WorkoutSet(int RepsCompleted, DateTimeOffset CompletionTime);

  public record WorkoutWeightedExercise(WorkoutPlanWeightedExercise PlanExercise, ImmutableListSequence<WorkoutSet?> Sets, decimal Weight)
  {
    public WorkoutSet? LastSet => Sets?.LastOrDefault(x => x is not null);
    public WorkoutWeightedExercise WithCycledRepCount(int repCountIndex)
    {
      var sets = Sets;
      // We cycle down from the goal sets, or back to null to reset it after 0
      var repCount = sets[repCountIndex] switch
      {
        null => new WorkoutSet(PlanExercise.RepsPerSet, DateTimeOffset.UtcNow),
        { RepsCompleted: 0 } => (WorkoutSet?)null,
        var reps => new WorkoutSet(reps.RepsCompleted - 1, DateTimeOffset.UtcNow)
      };

      sets = sets.SetItem(repCountIndex, repCount);

      return this with
      {
        Sets = sets,
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
            .FirstOrDefault(x => x.Sets.Any(set => set is null)
                              && !x.Sets.All(reps => reps is null));

    public WorkoutWeightedExercise? LastExercise
        => WeightedExercises
            .LastOrDefault(x => x.Sets.Any(set => set is not null)
                              && !x.Sets.All(reps => reps is not null));
  }

  public record WorkoutDayDao(
    Guid Id,
    WorkoutDay Day);
}
