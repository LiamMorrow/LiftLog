using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.App;

public record SetPageTitleAction(string Title);

public record SetProTokenAction(string? ProToken);

public record SetReopenCurrentSessionAction(bool ReopenCurrentSession);
