using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.Ui.Store.AiSessionCreator;

public record AiSessionCreatorState(
    bool IsLoading,
    SessionBlueprint? GeneratedSession,
    string? ErrorMessage
);
