using System.Text.RegularExpressions;
using LiftLog.Lib.Models;
using LiftLog.Ui.Models;
using LiftLog.Ui.Store.CurrentSession;

namespace LiftLog.Ui.Store.App;

public record SetPageTitleAction(string Title);

public record SetProTokenAction(string? ProToken);

public record SetReopenCurrentSessionAction(SessionTarget SessionTarget, bool ReopenSession);

public record ToastAction(string Message);

public record SetBackNavigationUrlAction(string? BackNavigationUrl);

public record SetHistoryYearMonthAction(int Year, int Month);

public record NavigateAction(
    string Path,
    bool ClearPageStack = true,
    Regex? IfCurrentPathMatches = null
);

public record SetLatestSettingsUrlAction(string? LatestSettingsUrl);

public record SetAppStateIsHydratedAction(bool IsHydrated);

public record ThemeColorUpdatedAction(AppColorScheme<uint> Scheme, bool IsDark);

public record IncrementAppLaunchCountAction();

public record SetAppLaunchCountAction(int AppLaunchCount);

public record RequestReviewAction();

public record SetAppRatingResultAction(AppRatingResult AppRatingResult);
