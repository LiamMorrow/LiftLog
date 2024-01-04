using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.Settings;

public record SettingsState(
    AiWorkoutAttributes? AiWorkoutAttributes,
    bool IsGeneratingAiPlan,
    string? AiPlanError,
    AiWorkoutPlan? AiPlan,
    bool UseImperialUnits,
    bool ShowBodyweight,
    bool ShowTips,
    int TipToShow,
    bool ShowFeed
);
