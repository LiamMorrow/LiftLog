using System.Threading.Tasks;
using Fluxor;
using Microsoft.AspNetCore.Components;
using LiftLog.Lib.Models;
using LiftLog.Lib.Store;
using LiftLog.WebUi.Store.CurrentSession;

namespace LiftLog.WebUi.Pages
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

        private void UpdateWeightForExercise(int exerciseIndex, decimal weight)
        {
            Dispatcher.Dispatch(new UpdateExerciseWeightAction(exerciseIndex, weight));
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

        private async void CloseSession()
        {
            await ProgressStore.ClearCurrentDayAsync();

            Dispatcher.Dispatch(new SetWorkoutDayAction(null));
            NavigationManager.NavigateTo("/");
        }
    }
}
