using LiftLog.Api.Service;

namespace LiftLog.Tests.Api.Unit;

public class AiPlanToolProviderTests
{
    [Test]
    [Category("Unit")]
    public async Task EmbeddedSchema_LoadsWithExpectedRootShape()
    {
        var schema = AiPlanToolProvider.LoadInputSchema();

        await Assert.That(schema.Type.GetString()).IsEqualTo("object");
        await Assert.That(schema.Properties!.ContainsKey("version")).IsTrue();
        await Assert.That(schema.Properties!.ContainsKey("name")).IsTrue();
        await Assert.That(schema.Properties!.ContainsKey("description")).IsTrue();
        await Assert.That(schema.Properties!.ContainsKey("blueprint")).IsTrue();
        await Assert
            .That(schema.Required!)
            .IsEquivalentTo(new[] { "version", "name", "description", "blueprint" });
    }

    [Test]
    [Category("Unit")]
    public async Task EmbeddedSchema_CarriesDefinitionsForReferencedTypes()
    {
        var schema = AiPlanToolProvider.LoadInputSchema();

        await Assert.That(schema.RawData.ContainsKey("definitions")).IsTrue();
        var definitions = schema.RawData["definitions"];
        await Assert.That(definitions.TryGetProperty("ProgramBlueprint", out _)).IsTrue();
        await Assert.That(definitions.TryGetProperty("CardioExerciseBlueprint", out _)).IsTrue();
    }

    [Test]
    [Category("Unit")]
    public async Task Tool_IsConfiguredForEagerStreaming()
    {
        var tool = new AiPlanToolProvider().Tool;

        await Assert.That(tool.Name).IsEqualTo("create_workout_plan");
        await Assert.That(tool.EagerInputStreaming).IsEqualTo(true);
    }

    [Test]
    [Category("Unit")]
    public async Task CurrentAiPlanVersion_IsReadFromSchema()
    {
        await Assert.That(new AiPlanToolProvider().CurrentAiPlanVersion).IsEqualTo(2);
    }
}
