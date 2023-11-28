namespace LiftLog.Ui.Models.SessionHistoryDao;

using System.Collections.Immutable;
using LiftLog.Lib;

internal record SessionHistoryDaoContainer(
    ImmutableDictionary<Guid, Lib.Models.Session> CompletedSessions
);
