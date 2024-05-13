using Fluxor;
using LiftLog.Lib.Models;
using LiftLog.Ui.Store.Settings;

namespace LiftLog.Ui.Store.Settings;

public static class SettingsReducers
{
    [ReducerMethod]
    public static SettingsState SetSettingsIsHydrated(
        SettingsState state,
        SetSettingsIsHydratedAction _
    ) => state with { IsHydrated = true };

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

    [ReducerMethod]
    public static SettingsState SetSetTipToShow(SettingsState state, SetTipToShowAction action) =>
        state with
        {
            TipToShow = action.TipToShow
        };

    [ReducerMethod]
    public static SettingsState SetShowFeed(SettingsState state, SetShowFeedAction action) =>
        state with
        {
            ShowFeed = action.ShowFeed
        };

    [ReducerMethod]
    public static SettingsState SetStatusBarFix(
        SettingsState state,
        SetStatusBarFixAction action
    ) => state with { StatusBarFix = action.StatusBarFix };
}
