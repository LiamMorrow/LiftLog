using System.Net;
using System.Text.Json;
using FluentValidation;
using LiftLog.Api.Service;
using LiftLog.Lib.Models;
using LiftLog.Lib.Serialization;
using LiftLog.Lib.Services;
using Microsoft.AspNetCore.Mvc;

namespace LiftLog.Api.Controllers;

[ApiController]
public class GenerateAiWorkoutController(
    IAiWorkoutPlanner aiWorkoutPlanner,
    RateLimitService rateLimitService,
    PurchaseVerificationService purchaseVerificationService,
    IValidator<GenerateAiWorkoutPlanRequest> aiWorkoutPlanRequestValidator,
    IValidator<GenerateAiSessionRequest> aiSessionRequestValidator,
    ILogger<GenerateAiWorkoutController> logger
) : ControllerBase
{
    [Route("/ai/workout")]
    [HttpPost]
    public async Task<IActionResult> GenerateAiWorkout(
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

    [Route("/ai/session")]
    [HttpPost]
    public async Task<IActionResult> RunAiSession(
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

    private async Task<IActionResult?> GetAuthErrorAsync(string? headerAuth, string? bodyAuth)
    {
        if (headerAuth is null && bodyAuth is null)
        {
            logger.LogWarning("Invalid request. Missing Authorization");
            return StatusCode((int)HttpStatusCode.Forbidden);
        }

        var authorizationParts = (bodyAuth ?? headerAuth)!.Split(" ");
        if (authorizationParts.Length != 2)
        {
            logger.LogWarning("Invalid request Incorrect authorization format");
            return StatusCode((int)HttpStatusCode.Forbidden);
        }

        var appStore = JsonSerializer.Deserialize<AppStore>(
            $"\"{authorizationParts[0]}\"",
            JsonSerializerSettings.LiftLog
        );
        var proToken = authorizationParts[1];

        if (!await purchaseVerificationService.IsValidPurchaseToken(appStore, proToken))
        {
            logger.LogWarning("Invalid request. Bad Auth.");
            return StatusCode((int)HttpStatusCode.Forbidden);
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
