using System.Collections.Immutable;
using System.Text.Json.Serialization;

namespace LiftLog.Lib.Models;

public enum AppStore
{
    Web,
    Google,
    Apple,
    RevenueCat,
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
    ImmutableList<string> Goals,
    Experience Experience,
    bool UseImperialUnits,
    string AdditionalInfo
);

public record AiWorkoutPlan(
    string Name,
    string Description,
    ImmutableList<SessionBlueprint> Sessions
);

public record AiSessionAttributes(
    ImmutableList<string> AreasToWorkout,
    int Volume,
    [property: JsonPropertyName("exerciseToKilograms")]
        ImmutableDictionary<string, decimal> ExerciseToWeight,
    bool UseImperialUnits,
    string AdditionalInfo
);
