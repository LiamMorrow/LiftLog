namespace LiftLog.Tests.Api.Integration.Helpers;

/// <summary>
/// Marks tests that drive the real Anthropic API. A live model is non-deterministic and costs money
/// per run, so they are opt in: set <c>LIFTLOG_LIVE_AI_TESTS=true</c> to include them. The rest of
/// the AI chat path is covered deterministically by
/// <see cref="Integration.AiWorkoutPlannerV2IntegrationTests" />, which fakes the streaming seam.
/// </summary>
public class RequiresAnthropicApiKeyAttribute()
    : SkipAttribute("Live Anthropic tests are opt in - set LIFTLOG_LIVE_AI_TESTS=true to run them")
{
    public const string EnvironmentVariable = "LIFTLOG_LIVE_AI_TESTS";

    public override Task<bool> ShouldSkip(TestRegisteredContext context) =>
        Task.FromResult(
            !string.Equals(
                Environment.GetEnvironmentVariable(EnvironmentVariable),
                "true",
                StringComparison.OrdinalIgnoreCase
            )
        );
}
