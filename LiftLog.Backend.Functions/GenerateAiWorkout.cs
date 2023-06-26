using System.Net;
using System.Text.Json;
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

        public GenerateAiWorkout(IAiWorkoutPlanner aiWorkoutPlanner, ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory.CreateLogger<GenerateAiWorkout>();
            this.aiWorkoutPlanner = aiWorkoutPlanner;
        }

        [Function("GenerateAiWorkout")]
        public async Task<HttpResponseData> Run([HttpTrigger(AuthorizationLevel.Anonymous, "post")] HttpRequestData req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a request.");

            var response = req.CreateResponse(HttpStatusCode.OK);
            var request = await JsonSerializer.DeserializeAsync<GenerateAiWorkoutPlanRequest>(req.Body, JsonSerializerSettings.LiftLog);
            if (request == null)
            {
                response.StatusCode = HttpStatusCode.BadRequest;
                await response.WriteAsJsonAsync(new { error = new[] { "Invalid request" } });
                return response;
            }

            var requestValidator = new GenerateAiWorkoutRequestValidator();
            var validationResult = requestValidator.Validate(request);
            if (!validationResult.IsValid)
            {
                response.StatusCode = HttpStatusCode.BadRequest;
                await response.WriteAsJsonAsync(new { error = validationResult.Errors });
                return response;
            }

            var plan = await aiWorkoutPlanner.GenerateWorkoutPlanAsync(request.Attributes);
            response.Headers.Add("Content-Type", "application/json; charset=utf-8");
            await response.WriteBytesAsync(JsonSerializer.SerializeToUtf8Bytes(plan, JsonSerializerSettings.LiftLog));

            return response;
        }
    }
}
