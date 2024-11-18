using System.Collections.Immutable;
using System.Diagnostics.CodeAnalysis;
using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Ui.Models;
using LiftLog.Ui.Store.CurrentSession;

namespace LiftLog.Ui.Store.App;

public record AppState(
    string Title,
    ProState ProState,
    bool IsHydrated,
    ImmutableHashSet<SessionTarget> ReopenCurrentSessionTargets,
    string? BackNavigationUrl,
    string? LatestSettingsUrl,
    bool HasRequestedNotificationPermission,
    AppColorScheme<uint> ColorScheme,
    int AppLaunchCount,
    AppRatingResult AppRatingResult,
    (int Year, int Month)? HistoryYearMonth
)
{
    public static readonly AppState InitialState = new(
        Title: "LiftLog",
        IsHydrated: false,
        ProState: new ProState(ProToken: null),
        ReopenCurrentSessionTargets:
        [
            SessionTarget.WorkoutSession,
            SessionTarget.HistorySession,
            SessionTarget.FeedSession,
        ],
        BackNavigationUrl: null,
        LatestSettingsUrl: null,
        HasRequestedNotificationPermission: false,
        ColorScheme: new AppColorScheme<uint>(),
        AppLaunchCount: 0,
        AppRatingResult: AppRatingResult.NotRated,
        HistoryYearMonth: null
    );
};

public enum AppRatingResult
{
    NotRated,
    Rated,
    Declined,
}

public record ProState(string? ProToken)
{
    [MemberNotNullWhen(true, nameof(ProToken))]
    public bool IsPro => !string.IsNullOrEmpty(ProToken);
}
