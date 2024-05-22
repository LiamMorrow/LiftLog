using System.Text.RegularExpressions;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.App;

public record SetPageTitleAction(string Title);

public record SetProTokenAction(string? ProToken);

public record SetReopenCurrentSessionAction(bool ReopenCurrentSession);

public record SetBackNavigationUrlAction(string? BackNavigationUrl);

public record NavigateAction(
    string Path,
    bool ClearPageStack = true,
    Regex? IfCurrentPathMatches = null
);

public record SetLatestSettingsUrlAction(string? LatestSettingsUrl);
