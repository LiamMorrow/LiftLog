#if DEBUG
using LiftLog.Lib.Models;
using LiftLog.Ui.Services;
using LiftLog.Ui.Store.App;
using LiftLog.Ui.Store.CurrentSession;
using LiftLog.Ui.Store.Program;

namespace LiftLog.Ui.Pages.Screenshot;

public partial class ScreenshotCollectorPage
{
    private SessionBlueprint demoSessionBlueprint = new(
        Name: "Session 1",
        Exercises:
        [
            new ExerciseBlueprint(
                Name: "Squat",
                Sets: 3,
                RepsPerSet: 10,
                WeightIncreaseOnSuccess: 2.5m,
                RestBetweenSets: Rest.Medium,
                SupersetWithNext: false,
                Notes: "",
                Link: ""
            ),
            new ExerciseBlueprint(
                Name: "Bench Press",
                Sets: 3,
                RepsPerSet: 10,
                WeightIncreaseOnSuccess: 2.5m,
                RestBetweenSets: Rest.Medium,
                SupersetWithNext: false,
                Notes: "",
                Link: ""
            ),
            new ExerciseBlueprint(
                Name: "Deadlift",
                Sets: 3,
                RepsPerSet: 10,
                WeightIncreaseOnSuccess: 2.5m,
                RestBetweenSets: Rest.Medium,
                SupersetWithNext: false,
                Notes: "",
                Link: ""
            ),
        ],
        Notes: ""
    );

    private async Task HandleHomeScreenshotCollection()
    {
        var builtInProgram = BuiltInProgramService.BuiltInPrograms.First();
        Dispatcher.Dispatch(new SetCurrentSessionAction(SessionTarget.WorkoutSession, null));
        Dispatcher.Dispatch(new SetActiveProgramAction(builtInProgram.Key));
        Dispatcher.Dispatch(
            new SetProgramSessionsAction(
                ProgramState.Value.ActivePlanId,
                builtInProgram.Value.Sessions
            )
        );
        Dispatcher.Dispatch(new NavigateAction($"/"));
        await Task.Yield();
    }
}
#endif
