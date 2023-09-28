using Fluxor;

namespace LiftLog.Ui.Store.AiSessionCreator;

public static class AiSessionCreatorReducers
{
    [ReducerMethod]
    public static AiSessionCreatorState SetAiGeneratedSessionIsLoading(
        AiSessionCreatorState state,
        SetAiGeneratedSessionIsLoadingAction action
    )
    {
        return state with { IsLoading = action.IsLoading };
    }

    [ReducerMethod]
    public static AiSessionCreatorState SetAiGeneratedSession(
        AiSessionCreatorState state,
        SetAiGeneratedSessionAction action
    )
    {
        return state with { GeneratedSession = action.GeneratedSession };
    }

    [ReducerMethod]
    public static AiSessionCreatorState SetAiSessionErrorMessage(
        AiSessionCreatorState state,
        SetAiSessionErrorMessageAction action
    )
    {
        return state with { ErrorMessage = action.ErrorMessage };
    }

    [ReducerMethod]
    public static AiSessionCreatorState ClearAiGeneratedSessionState(
        AiSessionCreatorState state,
        ClearAiGeneratedSessionStateAction action
    )
    {
        return new(IsLoading: false, GeneratedSession: null, ErrorMessage: null);
    }
}
