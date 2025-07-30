using System.Text.Json.Serialization;

namespace LiftLog.Lib.Models;

public record GenerateAiWorkoutPlanRequest(
    [property: JsonPropertyName("attributes")] AiWorkoutAttributes Attributes,
    [property: JsonPropertyName("auth")] string? Auth
);

public record GenerateAiSessionRequest(
    [property: JsonPropertyName("attributes")] AiSessionAttributes Attributes,
    [property: JsonPropertyName("auth")] string? Auth
);
