using System.Net;
using FluentValidation;
using LiftLog.Api.Authentication;
using LiftLog.Api.Service;
using LiftLog.Lib.Models;
using LiftLog.Lib.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LiftLog.Api.Controllers;

[ApiController]
[Authorize(AuthenticationSchemes = PurchaseTokenAuthenticationSchemeOptions.SchemeName)]
public class GenerateAiWorkoutController(
    IAiWorkoutPlanner aiWorkoutPlanner,
    IValidator<GenerateAiWorkoutPlanRequest> aiWorkoutPlanRequestValidator,
    IValidator<GenerateAiSessionRequest> aiSessionRequestValidator,
    RateLimitService rateLimitService
) : ControllerBase
{
    [Route("/ai/workout")]
    [HttpPost]
    public async Task<IActionResult> GenerateAiWorkout(GenerateAiWorkoutPlanRequest request)
    {
        if (request == null)
        {
            return BadRequest();
        }

        var validationResult = aiWorkoutPlanRequestValidator.Validate(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(new { error = validationResult.Errors });
        }

        // Get authenticated user information
        var userId = this.GetUserId();
        var appStore = this.GetAppStore();
        var proToken = this.GetProToken();

        // Check rate limits
        var rateLimitCheck = await CheckRateLimitsAsync(appStore, proToken);
        if (rateLimitCheck != null)
        {
            return rateLimitCheck;
        }

        var plan = await aiWorkoutPlanner.GenerateWorkoutPlanAsync(request.Attributes);
        return Ok(plan);
    }

    [Route("/ai/session")]
    [HttpPost]
    public async Task<IActionResult> RunAiSession(GenerateAiSessionRequest request)
    {
        if (request == null)
        {
            return BadRequest();
        }

        var validationResult = aiSessionRequestValidator.Validate(request);
        if (!validationResult.IsValid)
        {
            return BadRequest(new { error = validationResult.Errors });
        }

        // Get authenticated user information
        var appStore = this.GetAppStore();
        var proToken = this.GetProToken();

        // Check rate limits
        var rateLimitCheck = await CheckRateLimitsAsync(appStore, proToken);
        if (rateLimitCheck != null)
        {
            return rateLimitCheck;
        }

        var plan = await aiWorkoutPlanner.GenerateSessionAsync(request.Attributes);
        return Ok(plan);
    }

    private async Task<IActionResult?> CheckRateLimitsAsync(AppStore? appStore, string? proToken)
    {
        if (appStore.HasValue && !string.IsNullOrEmpty(proToken))
        {
            var rateLimitResult = await rateLimitService.GetRateLimitAsync(
                appStore.Value,
                proToken
            );
            if (rateLimitResult.IsRateLimited)
            {
                HttpContext.Response.Headers.Append(
                    "Retry-After",
                    rateLimitResult.RetryAfter.ToString("R")
                );
                return StatusCode((int)HttpStatusCode.TooManyRequests);
            }
        }
        return null;
    }
}
