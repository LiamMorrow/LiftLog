#if DEBUG
using LiftLog.Lib.Models;
using LiftLog.Ui.Store.App;
using LiftLog.Ui.Store.CurrentSession;
using LiftLog.Ui.Store.Program;

namespace LiftLog.Ui.Pages.Screenshot;

public partial class ScreenshotCollectorPage
{
    private SessionBlueprint demoSessionBlueprint =
        new(
            Name: "Session 1",
            Exercises:
            [
                new ExerciseBlueprint(
                    Name: "Squat",
                    Sets: 3,
                    RepsPerSet: 10,
                    WeightIncreaseOnSuccess: 2.5m,
                    RestBetweenSets: Rest.Medium,
                    SupersetWithNext: false
                ),
                new ExerciseBlueprint(
                    Name: "Bench Press",
                    Sets: 3,
                    RepsPerSet: 10,
                    WeightIncreaseOnSuccess: 2.5m,
                    RestBetweenSets: Rest.Medium,
                    SupersetWithNext: false
                ),
                new ExerciseBlueprint(
                    Name: "Deadlift",
                    Sets: 3,
                    RepsPerSet: 10,
                    WeightIncreaseOnSuccess: 2.5m,
                    RestBetweenSets: Rest.Medium,
                    SupersetWithNext: false
                )
            ]
        );

    private async Task HandleProgramEditorScreenshotCollection()
    {
        Dispatcher.Dispatch(new SetProgramSessionsAction([demoSessionBlueprint]));
        Dispatcher.Dispatch(new NavigateAction("/settings/manage-workouts/manage-session/0"));
        await Task.Yield();
    }
}
#endif
