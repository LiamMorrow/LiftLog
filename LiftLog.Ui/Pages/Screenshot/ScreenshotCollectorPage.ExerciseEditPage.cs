#if DEBUG
using LiftLog.Lib.Models;
using LiftLog.Ui.Store.App;
using LiftLog.Ui.Store.CurrentSession;
using LiftLog.Ui.Store.Program;

namespace LiftLog.Ui.Pages.Screenshot;

public partial class ScreenshotCollectorPage
{
    private async Task HandleExerciseEditorScreenshotCollection()
    {
        Dispatcher.Dispatch(new SetProgramSessionsAction([demoSessionBlueprint]));
        Dispatcher.Dispatch(
            new NavigateAction("/settings/manage-workouts/manage-session/0?editingExercise=0")
        );
        await Task.Yield();
    }
}
#endif
