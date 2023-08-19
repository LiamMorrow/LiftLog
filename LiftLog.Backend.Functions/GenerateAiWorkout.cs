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
        private readonly PurchaseVerificationService purchaseVerificationService;

        public GenerateAiWorkout(
            IAiWorkoutPlanner aiWorkoutPlanner,
            RateLimitService rateLimitService,
            PurchaseVerificationService purchaseVerificationService,
            ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory.CreateLogger<GenerateAiWorkout>();
            this.aiWorkoutPlanner = aiWorkoutPlanner;
            this.rateLimitService = rateLimitService;
            this.purchaseVerificationService = purchaseVerificationService;
        }

        [Function("GenerateAiWorkout")]
        public async Task<HttpResponseData> Run([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a request.");

            var response = req.CreateResponse(HttpStatusCode.OK);

            if (!req.Headers.TryGetValues("authorization", out var authorization))
            {
                await response.WriteAsJsonAsync(new { error = new[] { "Invalid request. Missing Authorization" } });
                response.StatusCode = HttpStatusCode.Forbidden;
                return response;
            }

            var authorizationParts = authorization.First().Split(" ");
            if (authorizationParts.Length != 2)
            {
                await response.WriteAsJsonAsync(new { error = new[] { "Invalid request Incorrect authorization format" } });
                response.StatusCode = HttpStatusCode.Forbidden;
                return response;
            }

            var appStore = JsonSerializer.Deserialize<AppStore>($"\"{authorizationParts[0]}\"", JsonSerializerSettings.LiftLog);
            var proToken = authorizationParts[1];

            if (!await purchaseVerificationService.IsValidPurchaseToken(appStore, proToken))
            {
                await response.WriteAsJsonAsync(new { error = new[] { "Invalid request. Bad Auth." } });
                response.StatusCode = HttpStatusCode.Forbidden;
                return response;
            }

            var rateLimitResult = await rateLimitService.GetRateLimitAsync(proToken);
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
