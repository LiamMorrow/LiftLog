#if DEBUG
using Fluxor;
using LiftLog.Ui.Services;
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
    public string ScreenshotCollectionType { get; set; } = "";

    protected override async Task OnInitializedAsync()
    {
        await ProgressRepository.ClearAsync();
        Dispatcher.Dispatch(new SetProgramSessionsAction(ProgramState.Value.ActivePlanId, []));
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

        switch (ScreenshotCollectionType.ToLower())
        {
            case "workoutpage":
                await HandleWorkoutPageScreenshotCollection();
                break;
            case "home":
                await HandleHomeScreenshotCollection();
                break;
            case "exerciseeditor":
                await HandleExerciseEditorScreenshotCollection();
                break;
            case "stats":
                await HandleStatsScreenshotCollection("/stats");
                break;
            case "history":
                await HandleStatsScreenshotCollection("/history");
                break;
            case "ai":
                await HandleAiPageScreenshotCollection();
                break;
            case "ai-session":
                await HandleAiSessionScreenshotCollection();
                break;
        }
        await base.OnInitializedAsync();
    }
}
#endif
