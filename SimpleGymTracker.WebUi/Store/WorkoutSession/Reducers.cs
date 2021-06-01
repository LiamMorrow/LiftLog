using System;
using System.Linq;
using Fluxor;

namespace SimpleGymTracker.WebUi.Store.WorkoutSession
{
  public static class Reducers
  {
    [ReducerMethod]
    public static WorkoutSessionState CycleExerciseReps(WorkoutSessionState state, CycleExerciseRepsAction action)
    {
      if (state.DayDao is null)
      {
        throw new Exception();
      }
      var day = state.DayDao.Day;

      return state with
      {
        DayDao = state.DayDao with
        {
          Day = day with
          {
            WeightedExercises = day
              .WeightedExercises.SetItem(
                  action.ExerciseIndex,
                  day.WeightedExercises[action.ExerciseIndex].WithCycledRepCount(action.SetIndex))
          }
        }
      };
    }

    [ReducerMethod]
    public static WorkoutSessionState SetWorkoutDay(WorkoutSessionState state, SetWorkoutDayAction action)
        => state with { DayDao = action.Day };
  }
}
