using LiftLog.Lib;
using LiftLog.Lib.Models;

namespace LiftLog.Backend.Services;

public interface IAiWorkoutPlanner
{
    Task<AiWorkoutPlan> GenerateWorkoutPlanAsync(AiWorkoutAttributes attributes);
}
