using System.Reflection;
using System.Text.Json;
using Anthropic.Models.Messages;

namespace LiftLog.Api.Service;

/// <summary>
/// Loads the embedded <c>AiPlan.json</c> schema (generated from the TS
/// <c>storage/versions/latest/ai-plan.ts</c> by app/scripts/generate-json-schemas.js)
/// and exposes it as the Anthropic <see cref="Tool"/> used for plan generation.
/// </summary>
public class AiPlanToolProvider
{
    public const string ToolName = "create_workout_plan";

    private const string ResourceName = "AiPlan.json";

    public Tool Tool { get; }

    /// <summary>
    /// The current AI plan contract version, read from the embedded schema (the
    /// single source of truth — generated from the TS <c>AiPlanJSON.version</c>
    /// literal). The hub compares clients against this to ask users to update their app.
    /// </summary>
    public int CurrentAiPlanVersion { get; }

    public AiPlanToolProvider()
    {
        var schema = LoadInputSchema();
        CurrentAiPlanVersion = ReadVersion(schema);
        Tool = new Tool
        {
            Name = ToolName,
            Description =
                "Creates and returns a workout plan to the user. Use this when you have "
                + "enough information to generate a plan. The blueprint contains the full "
                + "program: sessions of weighted and/or cardio exercises with progressive "
                + "overload and rest configuration.",
            InputSchema = schema,
            EagerInputStreaming = true,
        };
    }

    private static int ReadVersion(InputSchema schema)
    {
        if (
            schema.Properties is { } properties
            && properties.TryGetValue("version", out var versionProperty)
            && versionProperty.TryGetProperty("const", out var constValue)
            && constValue.TryGetInt32(out var version)
        )
        {
            return version;
        }

        throw new InvalidOperationException("AiPlan schema is missing a numeric 'version' const.");
    }

    /// <summary>
    /// Reads the embedded schema into an <see cref="InputSchema"/>, carrying
    /// <c>type</c>/<c>properties</c>/<c>required</c>/<c>definitions</c> through
    /// verbatim (the <c>$schema</c> meta key is dropped).
    /// </summary>
    public static InputSchema LoadInputSchema()
    {
        var assembly = Assembly.GetExecutingAssembly();
        using var stream =
            assembly.GetManifestResourceStream(ResourceName)
            ?? throw new InvalidOperationException(
                $"Embedded resource '{ResourceName}' not found. Available: "
                    + string.Join(", ", assembly.GetManifestResourceNames())
            );

        using var doc = JsonDocument.Parse(stream);
        var raw = new Dictionary<string, JsonElement>();
        foreach (var prop in doc.RootElement.EnumerateObject())
        {
            if (prop.Name == "$schema")
            {
                continue;
            }
            raw[prop.Name] = prop.Value.Clone();
        }

        return InputSchema.FromRawUnchecked(raw);
    }
}
