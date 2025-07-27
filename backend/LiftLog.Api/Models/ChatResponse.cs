using System.Text.Json.Serialization;
using LiftLog.Lib.Models;

namespace LiftLog.Api.Models;

[JsonDerivedType(typeof(AiChatMessageResponse))]
[JsonDerivedType(typeof(AiChatPlanResponse))]
public abstract record AiChatResponse();

public record AiChatMessageResponse(string Message) : AiChatResponse
{
    public string Type => "messageResponse";
}

public record AiChatPlanResponse(AiWorkoutPlan Plan) : AiChatResponse
{
    public string Type => "chatPlan";
}
