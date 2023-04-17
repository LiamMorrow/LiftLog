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
        private IState<CurrentSessionState> CurrentSessionState { get; set; } = null!;

        [Inject]
        public IDispatcher Dispatcher { get; set; } = null!;

        private void CycleRepcountForExercise(int exerciseIndex, int setIndex)
        {
            Dispatcher.Dispatch(new CycleExerciseRepsAction(exerciseIndex, setIndex));
            Dispatcher.Dispatch(new NotifySetTimerAction());
        }

        private void UpdateWeightForExercise(int exerciseIndex, decimal kilograms)
        {
            Dispatcher.Dispatch(new UpdateExerciseWeightAction(exerciseIndex, kilograms));
        }

        private void SaveSession()
        {
            Dispatcher.Dispatch(new PersistCurrentSessionAction());
            Dispatcher.Dispatch(new SetCurrentSessionAction(null));

            NavigationManager.NavigateTo("/");
        }

        private void CloseSession()
        {
            NavigationManager.NavigateTo("/");
        }
    }
}
