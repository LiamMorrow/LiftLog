using System.Net;
using System.Text.Json;
using FluentValidation;
using Google.Apis.AndroidPublisher.v3.Data;
using LiftLog.Api.Service;
using LiftLog.Lib.Models;
using LiftLog.Lib.Serialization;
using LiftLog.Lib.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace LiftLog.Api;

[ApiController]
[Route("ai")]
public class GenerateAiWorkoutController(
    IAiWorkoutPlanner aiWorkoutPlanner,
    RateLimitService rateLimitService,
    PurchaseVerificationService purchaseVerificationService,
    IValidator<GenerateAiWorkoutPlanRequest> aiWorkoutPlanRequestValidator,
    IValidator<GenerateAiSessionRequest> aiSessionRequestValidator,
    ILogger<GenerateAiWorkoutController> logger
) : ControllerBase
{
    [Route("workout")]
    [HttpPost]
    public async Task<ActionResult> GenerateAiWorkout(
        [FromHeader(Name = "Authorization")] string? authorization,
        GenerateAiWorkoutPlanRequest request
    )
    {
        var authResponse = await GetAuthErrorAsync(authorization, request?.Auth);
        if (authResponse is not null)
        {
            return authResponse;
        }
        if (request == null)
        {
            return BadRequest();
        }

        var validationResult = aiWorkoutPlanRequestValidator.Validate(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(new { error = validationResult.Errors });
        }

        var plan = await aiWorkoutPlanner.GenerateWorkoutPlanAsync(request.Attributes);
        return Ok(plan);
    }

    [Route("session")]
    [HttpPost]
    public async Task<ActionResult> RunAiSession(
        [FromHeader(Name = "Authorization")] string? authorization,
        GenerateAiSessionRequest request
    )
    {
        var authResponse = await GetAuthErrorAsync(authorization, request?.Auth);
        if (authResponse is not null)
        {
            return authResponse;
        }

        if (request == null)
        {
            return BadRequest();
        }

        var validationResult = aiSessionRequestValidator.Validate(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(new { error = validationResult.Errors });
        }

        var plan = await aiWorkoutPlanner.GenerateSessionAsync(request.Attributes);
        return Ok(plan);
    }

    private async Task<ActionResult?> GetAuthErrorAsync(string? headerAuth, string? bodyAuth)
    {
        if (headerAuth is null && bodyAuth is null)
        {
            logger.LogWarning("Invalid request. Missing Authorization");
            return Forbid();
        }

        var authorizationParts = (bodyAuth ?? headerAuth)!.Split(" ");
        if (authorizationParts.Length != 2)
        {
            logger.LogWarning("Invalid request Incorrect authorization format");
            return Forbid();
        }

        var appStore = JsonSerializer.Deserialize<AppStore>(
            $"\"{authorizationParts[0]}\"",
            JsonSerializerSettings.LiftLog
        );
        var proToken = authorizationParts[1];

        if (!await purchaseVerificationService.IsValidPurchaseToken(appStore, proToken))
        {
            logger.LogWarning("Invalid request. Bad Auth.");
            return Forbid();
        }

        var rateLimitResult = await rateLimitService.GetRateLimitAsync(appStore, proToken);
        if (rateLimitResult.IsRateLimited)
        {
            HttpContext.Response.Headers.Append(
                "Retry-After",
                rateLimitResult.RetryAfter.ToString("R")
            );
            return StatusCode((int)HttpStatusCode.TooManyRequests);
        }

        return null;
    }
}
