namespace LiftLog.Lib.Models;

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
    Experience Experience);


public record AiWorkoutPlan(
    string Description,
    ImmutableListValue<SessionBlueprint> Sessions
);
