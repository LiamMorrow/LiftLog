using System.Text.Json.Nodes;
using Anthropic.Models.Messages;
using LiftLog.Api.Models;
using LiftLog.Api.Service;
using LiftLog.Tests.Api.Unit.Helpers;
using Microsoft.Extensions.Logging.Abstractions;
using static LiftLog.Tests.Api.Unit.Helpers.StreamEvents;

namespace LiftLog.Tests.Api.Unit;

public class AnthropicChatPlannerV2Tests
{
    // A complete AiPlan tool input with a cardio exercise and an IncreaseLowestSet
    // overload.
    private const string PlanJson = """
        {"name":"Test Plan","description":"A solid starter","blueprint":{"name":"Test Plan","sessions":[{"name":"Day 1","notes":"","exercises":[{"type":"WeightedExerciseBlueprint","name":"Squat","sets":3,"repsPerSet":5,"restBetweenSets":{"minRest":"PT1M30S","maxRest":"PT3M","failureRest":"PT5M"},"supersetWithNext":false,"notes":"","link":"","progressiveOverload":{"type":"IncreaseLowestSetProgressiveOverload","amount":"2.5","increaseStrategy":"all"}},{"type":"CardioExerciseBlueprint","name":"Treadmill Run","sets":[{"target":{"type":"time","value":"PT20M"},"trackDuration":true,"trackDistance":true,"trackResistance":false,"trackIncline":false,"trackWeight":false,"trackSteps":false}],"notes":"","link":""}]}]}}
        """;

    private static AnthropicChatPlannerV2 CreatePlanner(IAnthropicMessageStreamer streamer) =>
        new(
            streamer,
            new AiPlanToolProvider().Tool,
            "claude-sonnet-4-6",
            NullLogger<AnthropicChatPlannerV2>.Instance
        );

    private static async Task<List<AiChatResponseV2>> Run(
        AnthropicChatPlannerV2 planner,
        string message = "hi"
    )
    {
        var responses = new List<AiChatResponseV2>();
        await planner.SendMessageAsync(
            message,
            r =>
            {
                responses.Add(r);
                return Task.CompletedTask;
            }
        );
        return responses;
    }

    /// <summary>Split a payload into <paramref name="parts"/> contiguous fragments.</summary>
    private static IEnumerable<RawMessageStreamEvent> InputJsonFragments(
        string json,
        int parts,
        long index
    )
    {
        var size = (int)Math.Ceiling(json.Length / (double)parts);
        for (var i = 0; i < json.Length; i += size)
        {
            yield return InputJsonDelta(json.Substring(i, Math.Min(size, json.Length - i)), index);
        }
    }

    [Test]
    [Category("Unit")]
    public async Task TextDeltas_AreStreamedIncrementally()
    {
        var planner = CreatePlanner(
            new FakeAnthropicMessageStreamer([TextDelta("Hello "), TextDelta("there"), BlockStop()])
        );

        var responses = await Run(planner);

        var messages = responses.OfType<AiChatMessageResponseV2>().ToList();
        await Assert.That(messages.Select(m => m.Message)).IsEquivalentTo(["Hello ", "Hello there"]);
        await Assert.That(responses.OfType<AiChatPlanResponseV2>().Any()).IsFalse();
    }

    [Test]
    [Category("Unit")]
    public async Task ToolUse_AccumulatesPartialJson_IntoRichPlan()
    {
        var events = new List<RawMessageStreamEvent>
        {
            ToolUseStart("toolu_1", "create_workout_plan"),
        };
        events.AddRange(InputJsonFragments(PlanJson, parts: 4, index: 0));
        events.Add(BlockStop());

        var responses = await Run(CreatePlanner(new FakeAnthropicMessageStreamer(events)));

        var plan = responses.OfType<AiChatPlanResponseV2>().Single();
        await Assert.That(plan.Name).IsEqualTo("Test Plan");
        await Assert.That(plan.Description).IsEqualTo("A solid starter");

        var exercises = plan.Blueprint!["sessions"]![0]!["exercises"]!.AsArray();
        await Assert
            .That(exercises[0]!["progressiveOverload"]!["type"]!.GetValue<string>())
            .IsEqualTo("IncreaseLowestSetProgressiveOverload");
        await Assert
            .That(exercises[0]!["progressiveOverload"]!["increaseStrategy"]!.GetValue<string>())
            .IsEqualTo("all");
        await Assert
            .That(exercises[1]!["type"]!.GetValue<string>())
            .IsEqualTo("CardioExerciseBlueprint");
    }

    [Test]
    [Category("Unit")]
    public async Task MixedTextAndToolUse_EmitsBothInOrder()
    {
        var events = new List<RawMessageStreamEvent>
        {
            TextDelta("Here ", index: 0),
            TextDelta("you go", index: 0),
            ToolUseStart("toolu_1", "create_workout_plan", index: 1),
            InputJsonDelta(PlanJson, index: 1),
            BlockStop(index: 1),
        };

        var responses = await Run(CreatePlanner(new FakeAnthropicMessageStreamer(events)));

        await Assert.That(responses.Count).IsEqualTo(3);
        await Assert.That(responses[0]).IsTypeOf<AiChatMessageResponseV2>();
        await Assert
            .That(((AiChatMessageResponseV2)responses[1]).Message)
            .IsEqualTo("Here you go");
        await Assert.That(responses[2]).IsTypeOf<AiChatPlanResponseV2>();
    }

    [Test]
    [Category("Unit")]
    public async Task StopInProgress_HaltsStreaming()
    {
        AnthropicChatPlannerV2? planner = null;
        var events = new List<RawMessageStreamEvent>
        {
            TextDelta("hello"),
            TextDelta("world"),
            TextDelta("!"),
        };
        var streamer = new FakeAnthropicMessageStreamer(
            events,
            beforeEach: i =>
            {
                if (i == 1)
                {
                    planner!.StopInProgress();
                }
            }
        );
        planner = CreatePlanner(streamer);

        var responses = await Run(planner);

        await Assert.That(responses.Count).IsEqualTo(1);
        await Assert.That(((AiChatMessageResponseV2)responses[0]).Message).IsEqualTo("hello");
    }

    [Test]
    [Category("Unit")]
    public async Task AfterToolCall_AssistantAndToolResultAreAppendedToHistory()
    {
        var events = new List<RawMessageStreamEvent>
        {
            ToolUseStart("toolu_1", "create_workout_plan"),
            InputJsonDelta(PlanJson),
            BlockStop(),
        };
        var streamer = new FakeAnthropicMessageStreamer(events);
        var planner = CreatePlanner(streamer);

        await Run(planner, "first");
        await Run(planner, "second");

        // Turn 2 sends: [user "first", assistant(tool_use), user(tool_result), user "second"].
        var sent = streamer.LastParameters!.Messages;
        await Assert.That(sent.Count).IsEqualTo(4);
        await Assert.That((Role)sent[1].Role).IsEqualTo(Role.Assistant);
        await Assert.That((Role)sent[2].Role).IsEqualTo(Role.User);
    }
}
