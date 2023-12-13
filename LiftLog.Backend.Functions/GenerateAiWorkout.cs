using System.Net;
using System.Text.Json;
using Google.Apis.AndroidPublisher.v3.Data;
using LiftLog.Backend.Functions.Services;
using LiftLog.Backend.Functions.Validators;
using LiftLog.Lib.Models;
using LiftLog.Lib.Serialization;
using LiftLog.Lib.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace LiftLog.Backend.Functions;

public class GenerateAiWorkout(
    IAiWorkoutPlanner aiWorkoutPlanner,
    RateLimitService rateLimitService,
    PurchaseVerificationService purchaseVerificationService,
    ILoggerFactory loggerFactory
)
{
    private readonly ILogger _logger = loggerFactory.CreateLogger<GenerateAiWorkout>();

    [Function("GenerateAiWorkout")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req
    )
    {
        _logger.LogInformation("C# HTTP trigger function processed a request.");

        var request = await JsonSerializer.DeserializeAsync<GenerateAiWorkoutPlanRequest>(
            req.Body,
            JsonSerializerSettings.LiftLog
        );
        var authResponse = await GetAuthErrorAsync(req, request?.Auth);
        if (authResponse is not null)
        {
            return authResponse;
        }
        if (request == null)
        {
            var response = req.CreateResponse(HttpStatusCode.BadRequest);
            await response.WriteAsJsonAsync(new { error = new[] { "Invalid request" } });
            response.StatusCode = HttpStatusCode.BadRequest;
            return response;
        }

        var requestValidator = new GenerateAiWorkoutRequestValidator();
        var validationResult = requestValidator.Validate(request);
        if (!validationResult.IsValid)
        {
            var response = req.CreateResponse(HttpStatusCode.BadRequest);
            await response.WriteAsJsonAsync(new { error = validationResult.Errors });
            response.StatusCode = HttpStatusCode.BadRequest;
            return response;
        }

        var okResponse = req.CreateResponse(HttpStatusCode.OK);
        var plan = await aiWorkoutPlanner.GenerateWorkoutPlanAsync(request.Attributes);
        okResponse.Headers.Add("Content-Type", "application/json; charset=utf-8");
        await okResponse.WriteBytesAsync(
            JsonSerializer.SerializeToUtf8Bytes(plan, JsonSerializerSettings.LiftLog)
        );

        return okResponse;
    }

    [Function("GenerateAiSession")]
    public async Task<HttpResponseData> RunAiSession(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req
    )
    {
        _logger.LogInformation("C# HTTP trigger function processed a request.");

        var request = await JsonSerializer.DeserializeAsync<GenerateAiSessionRequest>(
            req.Body,
            JsonSerializerSettings.LiftLog
        );
        var authResponse = await GetAuthErrorAsync(req, request?.Auth);
        if (authResponse is not null)
        {
            return authResponse;
        }

        if (request == null)
        {
            var response = req.CreateResponse(HttpStatusCode.BadRequest);
            await response.WriteAsJsonAsync(new { error = new[] { "Invalid request" } });
            response.StatusCode = HttpStatusCode.BadRequest;
            return response;
        }

        var requestValidator = new GenerateAiSessionRequestValidator();
        var validationResult = requestValidator.Validate(request);
        if (!validationResult.IsValid)
        {
            var response = req.CreateResponse(HttpStatusCode.BadRequest);
            await response.WriteAsJsonAsync(new { error = validationResult.Errors });
            response.StatusCode = HttpStatusCode.BadRequest;
            return response;
        }

        var okResponse = req.CreateResponse(HttpStatusCode.OK);
        var plan = await aiWorkoutPlanner.GenerateSessionAsync(request.Attributes);
        okResponse.Headers.Add("Content-Type", "application/json; charset=utf-8");
        await okResponse.WriteBytesAsync(
            JsonSerializer.SerializeToUtf8Bytes(plan, JsonSerializerSettings.LiftLog)
        );

        return okResponse;
    }

    private async Task<HttpResponseData?> GetAuthErrorAsync(HttpRequestData req, string? bodyAuth)
    {
        if (!req.Headers.TryGetValues("authorization", out var authorization) && bodyAuth is null)
        {
            var response = req.CreateResponse(HttpStatusCode.Forbidden);
            await response.WriteAsJsonAsync(
                new { error = new[] { "Invalid request. Missing Authorization" } }
            );
            response.StatusCode = HttpStatusCode.Forbidden;
            return response;
        }

        var authorizationParts = (bodyAuth ?? authorization?.First())!.Split(" ");
        if (authorizationParts.Length != 2)
        {
            var response = req.CreateResponse(HttpStatusCode.Forbidden);
            await response.WriteAsJsonAsync(
                new { error = new[] { "Invalid request Incorrect authorization format" } }
            );
            response.StatusCode = HttpStatusCode.Forbidden;
            return response;
        }

        var appStore = JsonSerializer.Deserialize<AppStore>(
            $"\"{authorizationParts[0]}\"",
            JsonSerializerSettings.LiftLog
        );
        var proToken = authorizationParts[1];

        if (!await purchaseVerificationService.IsValidPurchaseToken(appStore, proToken))
        {
            var response = req.CreateResponse(HttpStatusCode.Forbidden);
            await response.WriteAsJsonAsync(new { error = new[] { "Invalid request. Bad Auth." } });
            response.StatusCode = HttpStatusCode.Forbidden;
            return response;
        }

        var rateLimitResult = await rateLimitService.GetRateLimitAsync(appStore, proToken);
        if (rateLimitResult.IsRateLimited)
        {
            var response = req.CreateResponse(HttpStatusCode.TooManyRequests);
            response.Headers.Add("Retry-After", rateLimitResult.RetryAfter.ToString("R"));
            response.StatusCode = HttpStatusCode.TooManyRequests;
            return response;
        }

        return null;
    }
}
