using SimpleGymTracker.Lib.Models;
using static SimpleGymTracker.Lib.Util;

namespace SimpleGymTracker.Lib
{
  public static partial class Plans
  {
    private static readonly Rest strongliftsRest = new Rest(90, 180, 300);

    public static WorkoutPlan Stronglifts = new WorkoutPlan("Stronglifts 5x5", ListOf(
        new WorkoutPlanDay("Workout A", ListOf(
          new WorkoutPlanWeightedExercise("Squat", Sets: 5, RepsPerSet: 5, InitialKilograms: 20, KilogramsIncreaseOnSuccess: 2.5m, strongliftsRest),
          new WorkoutPlanWeightedExercise("Bench Press", Sets: 5, RepsPerSet: 5, InitialKilograms: 20, KilogramsIncreaseOnSuccess: 2.5m, strongliftsRest),
          new WorkoutPlanWeightedExercise("Bentover Row", Sets: 5, RepsPerSet: 5, InitialKilograms: 20, KilogramsIncreaseOnSuccess: 2.5m, strongliftsRest)
        )),
        new WorkoutPlanDay("Workout B", ListOf(
          new WorkoutPlanWeightedExercise("Squat", Sets: 5, RepsPerSet: 5, InitialKilograms: 20, KilogramsIncreaseOnSuccess: 2.5m, strongliftsRest),
          new WorkoutPlanWeightedExercise("Overhead Press", Sets: 5, RepsPerSet: 5, InitialKilograms: 20, KilogramsIncreaseOnSuccess: 2.5m, strongliftsRest),
          new WorkoutPlanWeightedExercise("Deadlift", Sets: 1, RepsPerSet: 5, InitialKilograms: 20, KilogramsIncreaseOnSuccess: 5m, strongliftsRest)
        ))
      ));
  }
}
