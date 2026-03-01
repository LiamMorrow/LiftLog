using System.Text.Json.Serialization;
using LiftLog.Lib.Models;

namespace LiftLog.Api.Models;

[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(AiChatMessageResponse), typeDiscriminator: "messageResponse")]
[JsonDerivedType(typeof(AiChatPlanResponse), typeDiscriminator: "chatPlan")]
public abstract record AiChatResponse();

public record AiChatMessageResponse(string Message) : AiChatResponse;

public record AiChatPlanResponse(AiWorkoutPlan Plan) : AiChatResponse;
