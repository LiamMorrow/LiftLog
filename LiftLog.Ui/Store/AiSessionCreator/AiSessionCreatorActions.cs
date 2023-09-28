using LiftLog.Lib;
using LiftLog.Lib.Models;
using LiftLog.Ui.Models;

namespace LiftLog.Ui.Store.AiSessionCreator;

public record GenerateAiSessionAction(AiSessionCreatorModel Attributes);

public record ClearAiGeneratedSessionStateAction();

public record SetAiGeneratedSessionIsLoadingAction(bool IsLoading);

public record SetAiGeneratedSessionAction(SessionBlueprint? GeneratedSession);

public record SetAiSessionErrorMessageAction(string? ErrorMessage);
