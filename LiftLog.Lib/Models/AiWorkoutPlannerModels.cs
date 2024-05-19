using System.Collections.Immutable;
using System.Text.Json.Serialization;

namespace LiftLog.Lib.Models;

public enum AppStore
{
    Web,
    Google,
    Apple,
}

public enum Gender
{
    Male,
    Female,
    Other,
    PreferNotToSay,
}

public enum Experience
{
    Beginner,
    Intermediate,
    Advanced,
    Professional,
}

public record AiWorkoutAttributes(
    Gender Gender,
    string WeightRange,
    int Age,
    int DaysPerWeek,
    ImmutableListValue<string> Goals,
    Experience Experience,
    bool UseImperialUnits,
    string AdditionalInfo
);

public record AiWorkoutPlan(string Description, ImmutableListValue<SessionBlueprint> Sessions);

public record AiSessionAttributes(
    ImmutableListValue<string> AreasToWorkout,
    int Volume,
    // TODO: Legacy name
    [property: JsonPropertyName("exerciseToKilograms")]
        ImmutableDictionary<string, decimal> ExerciseToWeight,
    bool UseImperialUnits,
    string AdditionalInfo
);
