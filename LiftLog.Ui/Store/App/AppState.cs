using System.Diagnostics.CodeAnalysis;
using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Ui.Models;

namespace LiftLog.Ui.Store.App;

public record AppState(
    string Title,
    ProState ProState,
    bool IsHydrated,
    bool ReopenCurrentSession,
    string? BackNavigationUrl,
    string? LatestSettingsUrl,
    bool HasRequestedNotificationPermission,
    AppColorScheme<uint> ColorScheme,
    int AppLaunchCount,
    AppRatingResult AppRatingResult
);

public enum AppRatingResult
{
    NotRated,
    Rated,
    Declined
}

public record ProState(string? ProToken)
{
    [MemberNotNullWhen(true, nameof(ProToken))]
    public bool IsPro => !string.IsNullOrEmpty(ProToken);
}
