using System.Linq;
using Fluxor;

namespace SimpleGymTracker.WebUi.Store.Workout
{
  public static class Reducers
  {
    [ReducerMethod]
    public static WorkoutSessionState StartGameAction(WorkoutSessionState state, CycleExerciseRepsAction action) =>
        state with
        {
          Day = state.Day with
          {
            WeightedExercises = state.Day
                .WeightedExercises.SetItem(
                    action.ExerciseIndex,
                    state.Day.WeightedExercises[action.ExerciseIndex].WithCycledRepCount(action.SetIndex))
          }
        };
  }
}
