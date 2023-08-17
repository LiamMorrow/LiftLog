using System.Net;
using System.Text.Json;
using LiftLog.Backend.Functions.Services;
using LiftLog.Backend.Functions.Validators;
using LiftLog.Lib.Models;
using LiftLog.Lib.Serialization;
using LiftLog.Lib.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;

namespace LiftLog.Backend.Functions
{
    public class GenerateAiWorkout
    {
        private readonly ILogger _logger;
        private readonly IAiWorkoutPlanner aiWorkoutPlanner;
        private readonly RateLimitService rateLimitService;

        public GenerateAiWorkout(IAiWorkoutPlanner aiWorkoutPlanner, RateLimitService rateLimitService, ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory.CreateLogger<GenerateAiWorkout>();
            this.aiWorkoutPlanner = aiWorkoutPlanner;
            this.rateLimitService = rateLimitService;
        }

        [Function("GenerateAiWorkout")]
        public async Task<HttpResponseData> Run([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a request.");

            var response = req.CreateResponse(HttpStatusCode.OK);


            if (!req.Headers.TryGetValues("X-Forwarded-For", out var xForwardedFor))
            {
                await response.WriteAsJsonAsync(new { error = new[] { "Invalid request" } });
                response.StatusCode = HttpStatusCode.BadRequest;
                return response;
            }

            var rateLimitResult = await rateLimitService.GetRateLimitAsync(xForwardedFor.First());
            if (rateLimitResult.IsRateLimited)
            {
                response.Headers.Add("Retry-After", rateLimitResult.RetryAfter.ToString("R"));
                response.StatusCode = HttpStatusCode.TooManyRequests;
                return response;
            }

            var request = await JsonSerializer.DeserializeAsync<GenerateAiWorkoutPlanRequest>(req.Body, JsonSerializerSettings.LiftLog);
            if (request == null)
            {
                await response.WriteAsJsonAsync(new { error = new[] { "Invalid request" } });
                response.StatusCode = HttpStatusCode.BadRequest;
                return response;
            }

            var requestValidator = new GenerateAiWorkoutRequestValidator();
            var validationResult = requestValidator.Validate(request);
            if (!validationResult.IsValid)
            {
                await response.WriteAsJsonAsync(new { error = validationResult.Errors });
                response.StatusCode = HttpStatusCode.BadRequest;
                return response;
            }

            var plan = await aiWorkoutPlanner.GenerateWorkoutPlanAsync(request.Attributes);
            response.Headers.Add("Content-Type", "application/json; charset=utf-8");
            await response.WriteBytesAsync(JsonSerializer.SerializeToUtf8Bytes(plan, JsonSerializerSettings.LiftLog));

            return response;
        }
    }
}
