using System.Text;
using System.Text.Json;
using LiftLog.Lib.Models;
using LiftLog.Lib.Serialization;
using LiftLog.Lib.Services;

namespace LiftLog.Ui.Services;

public class ApiBasedAiWorkoutPlanner : IAiWorkoutPlanner
{
    private readonly HttpClient httpClient;

    public ApiBasedAiWorkoutPlanner(HttpClient httpClient)
    {
        this.httpClient = httpClient;
    }
    public async Task<AiWorkoutPlan> GenerateWorkoutPlanAsync(AiWorkoutAttributes attributes)
    {
        var response = await httpClient.PostAsync(
            "https://liftlog.azurewebsites.net/api/GenerateAiWorkout?",
            new StringContent(JsonSerializer.Serialize(new GenerateAiWorkoutPlanRequest(attributes), JsonSerializerSettings.LiftLog), Encoding.UTF8, "application/json"));

        if (!response.IsSuccessStatusCode)
        {
            throw new Exception("Failed to generate workout plan.");
        }

        var plan = JsonSerializer.Deserialize<AiWorkoutPlan>(response.Content.ReadAsStream(), JsonSerializerSettings.LiftLog);

        return plan ?? throw new Exception("Failed to generate workout plan.");
    }
}
