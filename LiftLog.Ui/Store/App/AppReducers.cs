using Fluxor;

namespace LiftLog.Ui.Store.App;

public static class AppReducers
{
    [ReducerMethod]
    public static AppState SetTitle(AppState state, SetPageTitleAction action) =>
        state with
        {
            Title = action.Title
        };

    [ReducerMethod]
    public static AppState SetProToken(AppState state, SetProTokenAction action) =>
        state with
        {
            ProState = new(action.ProToken)
        };

    [ReducerMethod]
    public static AppState SetReopenCurrentSession(
        AppState state,
        SetReopenCurrentSessionAction action
    ) => state with { ReopenCurrentSession = action.ReopenCurrentSession };

    [ReducerMethod]
    public static AppState SetBackNavigationUrl(
        AppState state,
        SetBackNavigationUrlAction action
    ) => state with { BackNavigationUrl = action.BackNavigationUrl };

    [ReducerMethod]
    public static AppState SetUseImperialUnits(AppState state, SetUseImperialUnitsAction action) =>
        state with
        {
            UseImperialUnits = action.UseImperialUnits
        };
}
