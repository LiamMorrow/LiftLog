using System.Text;
using System.Text.Json;
using Fluxor;
using LiftLog.Lib.Models;
using LiftLog.Lib.Serialization;
using LiftLog.Lib.Services;
using LiftLog.Ui.Store.App;

namespace LiftLog.Ui.Services;

public class ApiBasedAiWorkoutPlanner : IAiWorkoutPlanner
{
    private readonly HttpClient httpClient;
    private readonly IState<AppState> appState;
    private readonly IAppPurchaseService appPurchaseService;

    public ApiBasedAiWorkoutPlanner(HttpClient httpClient, IState<AppState> appState, IAppPurchaseService appPurchaseService)
    {
        this.httpClient = httpClient;
        this.appState = appState;
        this.appPurchaseService = appPurchaseService;
    }
    public async Task<AiWorkoutPlan> GenerateWorkoutPlanAsync(AiWorkoutAttributes attributes)
    {
        var proToken = appState.Value.ProState.ProToken;
        if (proToken is null)
        {
            throw new Exception("Please upgrade to pro to use this feature.");
        }

        var request = new HttpRequestMessage(HttpMethod.Post, "https://liftlog.azurewebsites.net/api/GenerateAiWorkout?");
        request.Headers.Add("Authorization", $"{appPurchaseService.GetAppStore()} {proToken}");
        request.Content = new StringContent(JsonSerializer.Serialize(new GenerateAiWorkoutPlanRequest(attributes), JsonSerializerSettings.LiftLog), Encoding.UTF8, "application/json");

        var response = await httpClient.SendAsync(request);
        if (!response.IsSuccessStatusCode)
        {
            throw new Exception("Failed to generate workout plan.");
        }

        var plan = JsonSerializer.Deserialize<AiWorkoutPlan>(response.Content.ReadAsStream(), JsonSerializerSettings.LiftLog);

        return plan ?? throw new Exception("Failed to generate workout plan.");
    }
}
