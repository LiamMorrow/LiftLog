using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace LiftLog.Api.Models;

/// <summary>
/// Chat responses sent over the <c>/ai-chat-v2</c> hub. A plan response carries
/// the blueprint as an opaque JSON node in the latest ProgramBlueprint format;
/// the TS app owns the blueprint shape and deserializes it directly.
/// </summary>
[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(AiChatMessageResponseV2), typeDiscriminator: "messageResponse")]
[JsonDerivedType(typeof(AiChatPlanResponseV2), typeDiscriminator: "chatPlan")]
[JsonDerivedType(typeof(AiChatUpdateRequiredResponseV2), typeDiscriminator: "updateRequired")]
public abstract record AiChatResponseV2();

public record AiChatMessageResponseV2(string Message) : AiChatResponseV2;

public record AiChatPlanResponseV2(
    string Name,
    string Description,
    JsonNode? Blueprint,
    int Version
) : AiChatResponseV2;

/// <summary>
/// Sent when the client's AI plan contract version is behind the server's: the
/// client cannot understand plans this server produces and must be updated.
/// </summary>
public record AiChatUpdateRequiredResponseV2(int RequiredVersion) : AiChatResponseV2;
