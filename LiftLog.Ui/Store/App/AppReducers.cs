using Fluxor;

namespace LiftLog.Ui.Store.App;

public static class AppReducers
{
    [ReducerMethod]
    public static AppState SetTitle(AppState state, SetPageTitleAction action) =>
        state with
        {
            Title = action.Title,
        };

    [ReducerMethod]
    public static AppState SetProToken(AppState state, SetProTokenAction action) =>
        state with
        {
            ProState = new(action.ProToken),
        };

    [ReducerMethod]
    public static AppState SetHistoryYearMonth(AppState state, SetHistoryYearMonthAction action) =>
        state with
        {
            HistoryYearMonth = (action.Year, action.Month),
        };

    [ReducerMethod]
    public static AppState SetThemeColor(AppState state, ThemeColorUpdatedAction action) =>
        state with
        {
            ColorScheme = action.Scheme,
        };

    [ReducerMethod]
    public static AppState SetAppLaunchCount(AppState state, SetAppLaunchCountAction action) =>
        state with
        {
            AppLaunchCount = action.AppLaunchCount,
        };

    [ReducerMethod]
    public static AppState SetAppRatingResult(AppState state, SetAppRatingResultAction action) =>
        state with
        {
            AppRatingResult = action.AppRatingResult,
        };

    [ReducerMethod]
    public static AppState SetReopenCurrentSession(
        AppState state,
        SetReopenCurrentSessionAction action
    ) =>
        state with
        {
            ReopenCurrentSessionTargets = action.ReopenSession
                ? state.ReopenCurrentSessionTargets.Add(action.SessionTarget)
                : state.ReopenCurrentSessionTargets.Remove(action.SessionTarget),
        };

    [ReducerMethod]
    public static AppState SetBackNavigationUrl(
        AppState state,
        SetBackNavigationUrlAction action
    ) => state with { BackNavigationUrl = action.BackNavigationUrl };

    [ReducerMethod]
    public static AppState SetLatestSettingsUrl(
        AppState state,
        SetLatestSettingsUrlAction action
    ) => state with { LatestSettingsUrl = action.LatestSettingsUrl };

    [ReducerMethod]
    public static AppState SetAppStateIsHydrated(
        AppState state,
        SetAppStateIsHydratedAction action
    ) => state with { IsHydrated = action.IsHydrated };
}
