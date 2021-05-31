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
      if (state.Day is null)
      {
        throw new Exception();
      }

      return state with
      {
        Day = state.Day with
        {
          WeightedExercises = state.Day
              .WeightedExercises.SetItem(
                  action.ExerciseIndex,
                  state.Day.WeightedExercises[action.ExerciseIndex].WithCycledRepCount(action.SetIndex))
        },
        RestTimerStart = DateTimeOffset.UtcNow
      };
    }

    [ReducerMethod]
    public static WorkoutSessionState SetWorkoutDay(WorkoutSessionState state, SetWorkoutDayAction action)
        => state with { Day = action.Day };
  }
}
