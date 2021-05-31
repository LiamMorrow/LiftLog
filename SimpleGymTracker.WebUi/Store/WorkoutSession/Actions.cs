using SimpleGymTracker.Lib.Models;

namespace SimpleGymTracker.WebUi.Store.WorkoutSession
{
  public record CycleExerciseRepsAction(int ExerciseIndex, int SetIndex);

  public record SetWorkoutDayAction(WorkoutDay? Day);
}
