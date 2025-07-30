using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.Lib.Services;

public interface IAiWorkoutPlanner
{
    Task<AiWorkoutPlan> GenerateWorkoutPlanAsync(AiWorkoutAttributes attributes);

    Task<SessionBlueprint> GenerateSessionAsync(AiSessionAttributes attributes);
}
