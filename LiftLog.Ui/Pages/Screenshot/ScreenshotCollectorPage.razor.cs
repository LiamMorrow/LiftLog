#if DEBUG
using Fluxor;
using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Ui.Services;
using LiftLog.Ui.Store.App;
using LiftLog.Ui.Store.CurrentSession;
using LiftLog.Ui.Store.Program;
using LiftLog.Ui.Store.Settings;
using Microsoft.AspNetCore.Components;

namespace LiftLog.Ui.Pages.Screenshot;

public partial class ScreenshotCollectorPage : ComponentBase
{
    [Inject]
    public IDispatcher Dispatcher { get; set; } = null!;

    [Inject]
    public ProgressRepository ProgressRepository { get; set; } = null!;

    [Inject]
    public IState<ProgramState> ProgramState { get; set; } = null!;

    [Parameter]
    [SupplyParameterFromQuery(Name = "type")]
    public string ScreenshotCollectionTypeString { get; set; } = "";

    protected override async Task OnInitializedAsync()
    {
        await ProgressRepository.ClearAsync();
        Dispatcher.Dispatch(new SetProgramSessionsAction([]));
        Dispatcher.Dispatch(new SetUseImperialUnitsAction(false));
        Dispatcher.Dispatch(new SetShowBodyweightAction(true));
        Dispatcher.Dispatch(new SetShowFeedAction(true));
        Dispatcher.Dispatch(new SetShowTipsAction(false));
        Dispatcher.Dispatch(
            new SetThemeAction(
                uint.Parse("00AA00", System.Globalization.NumberStyles.HexNumber),
                ThemePreference.Light
            )
        );

        var type = Enum.Parse<ScreenshotCollectionType>(
            ScreenshotCollectionTypeString.ToLowerInvariant()
        );
        switch (type)
        {
            case ScreenshotCollectionType.workoutpage:
                await HandleWorkoutPageScreenshotCollection();
                break;
        }
        await base.OnInitializedAsync();
    }

    private async Task HandleWorkoutPageScreenshotCollection()
    {
        var demoSessionBlueprint = new SessionBlueprint(
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
        var demoSession = demoSessionBlueprint.GetEmptySession();
        demoSession = demoSession with
        {
            RecordedExercises =
            [
                demoSession.RecordedExercises[0] with
                {
                    Weight = 100m,
                },
                demoSession.RecordedExercises[0] with
                {
                    Weight = 60m,
                },
                demoSession.RecordedExercises[0] with
                {
                    Weight = 120m,
                }
            ],
            Bodyweight = 85m
        };
        Dispatcher.Dispatch(new SetCurrentSessionAction(SessionTarget.WorkoutSession, demoSession));
        await Task.Yield();
        Dispatcher.Dispatch(new CycleExerciseRepsAction(SessionTarget.WorkoutSession, 0, 0));
        Dispatcher.Dispatch(new NavigateAction("/session"));
        await Task.Yield();
    }

    public enum ScreenshotCollectionType
    {
        workoutpage
    }
}
#endif
