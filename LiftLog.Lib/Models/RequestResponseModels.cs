using System.Text.Json.Serialization;

namespace LiftLog.Lib.Models;

public record GenerateAiWorkoutPlanRequest(
    [property: JsonPropertyName("attributes")] AiWorkoutAttributes Attributes
);

public record GenerateAiSessionRequest(
    [property: JsonPropertyName("attributes")] AiSessionAttributes Attributes
);
