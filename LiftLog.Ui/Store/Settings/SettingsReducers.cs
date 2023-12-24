using Fluxor;
using LiftLog.Lib.Models;
using LiftLog.Ui.Store.Settings;

namespace LiftLog.Ui.Store.SessionEditor;

public static class SettingsReducers
{
    [ReducerMethod]
    public static SettingsState SetIsGeneratingAiPlan(
        SettingsState state,
        SetIsGeneratingAiPlanAction action
    ) => state with { IsGeneratingAiPlan = action.IsGeneratingAiPlan };

    [ReducerMethod]
    public static SettingsState SetAiPlanError(SettingsState state, SetAiPlanErrorAction action) =>
        state with
        {
            AiPlanError = action.AiPlanError
        };

    [ReducerMethod]
    public static SettingsState SetAiPlan(SettingsState state, SetAiPlanAction action) =>
        state with
        {
            AiPlan = action.Plan
        };

    [ReducerMethod]
    public static SettingsState SetAiPlanAttributes(
        SettingsState state,
        SetAiPlanAttributesAction action
    ) => state with { AiWorkoutAttributes = action.Attributes };

    [ReducerMethod]
    public static SettingsState SetUseImperialUnits(
        SettingsState state,
        SetUseImperialUnitsAction action
    ) => state with { UseImperialUnits = action.UseImperialUnits };

    [ReducerMethod]
    public static SettingsState SetShowBodyweight(
        SettingsState state,
        SetShowBodyweightAction action
    ) => state with { ShowBodyweight = action.ShowBodyweight };

    [ReducerMethod]
    public static SettingsState SetShowTips(SettingsState state, SetShowTipsAction action) =>
        state with
        {
            ShowTips = action.ShowTips
        };
}
