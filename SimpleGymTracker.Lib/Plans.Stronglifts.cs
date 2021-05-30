using SimpleGymTracker.Lib.Models;
using static SimpleGymTracker.Lib.Util;

namespace SimpleGymTracker.Lib
{
  public static partial class Plans
  {
    private static readonly Rest s_strongliftsRest = new(90, 180, 300);

    public static WorkoutPlan Stronglifts { get; } = new WorkoutPlan("Stronglifts 5x5", ListOf(
        new WorkoutPlanDay("Workout A", ListOf(
          new WorkoutPlanWeightedExercise("Squat", Sets: 5, RepsPerSet: 5, InitialKilograms: 20, KilogramsIncreaseOnSuccess: 2.5m, s_strongliftsRest),
          new WorkoutPlanWeightedExercise("Bench Press", Sets: 5, RepsPerSet: 5, InitialKilograms: 20, KilogramsIncreaseOnSuccess: 2.5m, s_strongliftsRest),
          new WorkoutPlanWeightedExercise("Bentover Row", Sets: 5, RepsPerSet: 5, InitialKilograms: 20, KilogramsIncreaseOnSuccess: 2.5m, s_strongliftsRest)
        )),
        new WorkoutPlanDay("Workout B", ListOf(
          new WorkoutPlanWeightedExercise("Squat", Sets: 5, RepsPerSet: 5, InitialKilograms: 20, KilogramsIncreaseOnSuccess: 2.5m, s_strongliftsRest),
          new WorkoutPlanWeightedExercise("Overhead Press", Sets: 5, RepsPerSet: 5, InitialKilograms: 20, KilogramsIncreaseOnSuccess: 2.5m, s_strongliftsRest),
          new WorkoutPlanWeightedExercise("Deadlift", Sets: 1, RepsPerSet: 5, InitialKilograms: 20, KilogramsIncreaseOnSuccess: 5m, s_strongliftsRest)
        ))
      ));
  }
}
