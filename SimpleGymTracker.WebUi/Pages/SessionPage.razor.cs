using Fluxor;
using Microsoft.AspNetCore.Components;
using SimpleGymTracker.WebUi.Store.WorkoutSession;

namespace SimpleGymTracker.WebUi.Pages
{
  public partial class SessionPage
  {
    [Inject]
    private IState<WorkoutSessionState> WorkoutSessionState { get; set; } = null!;

    [Inject]
    public IDispatcher Dispatcher { get; set; } = null!;

    private void CycleRepcountForExercise(int exerciseIndex, int setIndex)
    {
      Dispatcher.Dispatch(new CycleExerciseRepsAction(exerciseIndex, setIndex));
    }
  }
}
