namespace LiftLog.Ui.Models.SessionHistoryDao;

using LiftLog.Lib;

internal record SessionHistoryDaoContainer(Lib.Models.Session? CurrentSession, ImmutableListSequence<Lib.Models.Session> CompletedSessions);
