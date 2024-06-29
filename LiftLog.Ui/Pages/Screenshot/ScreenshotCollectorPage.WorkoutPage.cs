#if DEBUG
using LiftLog.Lib.Models;
using LiftLog.Ui.Store.App;
using LiftLog.Ui.Store.CurrentSession;

namespace LiftLog.Ui.Pages.Screenshot;

public partial class ScreenshotCollectorPage
{
    private async Task HandleWorkoutPageScreenshotCollection()
    {
        var demoSession = demoSessionBlueprint.GetEmptySession();
        Dispatcher.Dispatch(new SetCurrentSessionAction(SessionTarget.WorkoutSession, demoSession));
        Dispatcher.Dispatch(new UpdateExerciseWeightAction(SessionTarget.WorkoutSession, 0, 100));
        Dispatcher.Dispatch(new UpdateExerciseWeightAction(SessionTarget.WorkoutSession, 1, 60));
        Dispatcher.Dispatch(new UpdateExerciseWeightAction(SessionTarget.WorkoutSession, 2, 120));
        Dispatcher.Dispatch(new UpdateBodyweightAction(SessionTarget.WorkoutSession, 85));
        Dispatcher.Dispatch(new CycleExerciseRepsAction(SessionTarget.WorkoutSession, 0, 0));
        Dispatcher.Dispatch(new NavigateAction("/session"));
        await Task.Yield();
    }
}
#endif
