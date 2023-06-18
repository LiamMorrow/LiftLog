using LiftLog.Lib;
using LiftLog.Lib.Models;

public interface IAiWorkoutPlanner
{
    Task<ImmutableListSequence<SessionBlueprint>> GenerateWorkoutPlanAsync(AiWorkoutAttributes attributes);
}
