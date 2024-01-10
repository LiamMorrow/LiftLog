using System.Text;
using System.Text.Json;
using Fluxor;
using LiftLog.Lib.Models;
using LiftLog.Lib.Serialization;
using LiftLog.Lib.Services;
using LiftLog.Ui.Store.App;

namespace LiftLog.Ui.Services;

public class ApiBasedAiWorkoutPlanner(
    HttpClient httpClient,
    IState<AppState> appState,
    IAppPurchaseService appPurchaseService
) : IAiWorkoutPlanner
{
    public async Task<AiWorkoutPlan> GenerateWorkoutPlanAsync(AiWorkoutAttributes attributes)
    {
        var proToken = appState.Value.ProState.ProToken;
        if (proToken is null)
        {
            throw new Exception("Please upgrade to pro to use this feature.");
        }

        var request = new HttpRequestMessage(
            HttpMethod.Post,
            "https://api.liftlog.online/ai/workout?"
        );
        request.Content = new StringContent(
            JsonSerializer.Serialize(
                new GenerateAiWorkoutPlanRequest(
                    attributes,
                    $"{appPurchaseService.GetAppStore()} {proToken}"
                ),
                JsonSerializerSettings.LiftLog
            ),
            Encoding.UTF8,
            "application/json"
        );

        var response = await httpClient.SendAsync(request);
        if (!response.IsSuccessStatusCode)
        {
            throw new AiFailedToGenerateException(
                $"Failed to generate workout plan with a non 200 response of {response.StatusCode}"
            );
        }

        var plan = JsonSerializer.Deserialize<AiWorkoutPlan>(
            response.Content.ReadAsStream(),
            JsonSerializerSettings.LiftLog
        );

        return plan ?? throw new AiFailedToGenerateException("Failed to deserialize workout plan.");
    }

    public async Task<SessionBlueprint> GenerateSessionAsync(AiSessionAttributes attributes)
    {
        var proToken = appState.Value.ProState.ProToken;
        if (proToken is null)
        {
            throw new Exception("Please upgrade to pro to use this feature.");
        }

        var request = new HttpRequestMessage(
            HttpMethod.Post,
            "https://api.liftlog.online/ai/session?"
        );
        request.Content = new StringContent(
            JsonSerializer.Serialize(
                new GenerateAiSessionRequest(
                    attributes,
                    $"{appPurchaseService.GetAppStore()} {proToken}"
                ),
                JsonSerializerSettings.LiftLog
            ),
            Encoding.UTF8,
            "application/json"
        );

        var response = await httpClient.SendAsync(request);
        if (!response.IsSuccessStatusCode)
        {
            throw new AiFailedToGenerateException(
                $"Failed to generate session with a non 200 response of {response.StatusCode}"
            );
        }

        var plan = JsonSerializer.Deserialize<SessionBlueprint>(
            response.Content.ReadAsStream(),
            JsonSerializerSettings.LiftLog
        );

        return plan ?? throw new AiFailedToGenerateException("Failed to deserialize session.");
    }
}

class AiFailedToGenerateException(string message) : Exception(message) { }
