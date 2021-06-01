using System.Threading.Tasks;
using Fluxor;
using Microsoft.AspNetCore.Components;
using SimpleGymTracker.Lib.Store;
using SimpleGymTracker.WebUi.Store.WorkoutSession;

namespace SimpleGymTracker.WebUi.Pages
{
  public partial class SessionPage
  {
    [Inject]
    private IState<WorkoutSessionState> WorkoutSessionState { get; set; } = null!;

    [Inject]
    public IDispatcher Dispatcher { get; set; } = null!;

    [Inject]
    public IProgressStore ProgressStore { get; set; } = null!;

    private void CycleRepcountForExercise(int exerciseIndex, int setIndex)
    {
      Dispatcher.Dispatch(new CycleExerciseRepsAction(exerciseIndex, setIndex));
    }

    private async void SaveSession()
    {
      if (WorkoutSessionState.Value.DayDao is not null)
      {
        await ProgressStore.SaveCompletedDayAsync(WorkoutSessionState.Value.DayDao);
      }

      await ProgressStore.ClearCurrentDayAsync();

      Dispatcher.Dispatch(new SetWorkoutDayAction(null));
      NavigationManager.NavigateTo("/");
    }
  }
}
