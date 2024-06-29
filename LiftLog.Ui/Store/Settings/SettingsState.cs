using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.Settings;

public record SettingsState(
    bool IsHydrated,
    AiWorkoutAttributes? AiWorkoutAttributes,
    bool IsGeneratingAiPlan,
    string? AiPlanError,
    AiWorkoutPlan? AiPlan,
    bool UseImperialUnits,
    bool ShowBodyweight,
    bool ShowTips,
    int TipToShow,
    bool ShowFeed,
    bool StatusBarFix,
    bool RestNotifications
);
