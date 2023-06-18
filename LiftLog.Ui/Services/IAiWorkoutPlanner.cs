using LiftLog.Lib;
using LiftLog.Lib.Models;

public interface IAiWorkoutPlanner
{
    Task<ImmutableListSequence<SessionBlueprint>> GenerateWorkoutPlanAsync(AiWorkoutAttributes attributes);
}


public class GptAiWorkoutPlanner : IAiWorkoutPlanner
{
    public async Task<ImmutableListSequence<SessionBlueprint>> GenerateWorkoutPlanAsync(AiWorkoutAttributes attributes)
    {
        await Task.Delay(3000);
        throw new NotImplementedException();
    }
}
