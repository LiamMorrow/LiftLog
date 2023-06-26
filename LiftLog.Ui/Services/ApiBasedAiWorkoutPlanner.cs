using LiftLog.Lib.Models;
using LiftLog.Lib.Services;

namespace LiftLog.Ui.Services;

public class ApiBasedAiWorkoutPlanner : IAiWorkoutPlanner
{
    public Task<AiWorkoutPlan> GenerateWorkoutPlanAsync(AiWorkoutAttributes attributes)
    {
        throw new NotImplementedException();
    }
}
