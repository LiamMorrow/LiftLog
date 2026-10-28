using LiftLog.Api.Models;
using LiftLog.Api.Service;

namespace LiftLog.Tests.Api.Unit;

public class LiveFeedRegistryTests
{
    private sealed class ManualTimeProvider(DateTimeOffset now) : TimeProvider
    {
        public DateTimeOffset Now { get; set; } = now;

        public override DateTimeOffset GetUtcNow() => Now;
    }

    private static readonly DateTimeOffset start = new(2026, 10, 28, 9, 0, 0, TimeSpan.Zero);

    private static LiveFrame FrameFor(Guid userId, Guid eventId, DateTimeOffset at) =>
        new(userId, eventId, [0x01], [0x02], at);

    [Test]
    public async Task GetFrames_HidesAFrameThirtyMinutesAfterItWasPublished()
    {
        var clock = new ManualTimeProvider(start);
        var registry = new LiveFeedRegistry(clock);
        var alice = Guid.NewGuid();
        registry.Publish(FrameFor(alice, Guid.NewGuid(), start));

        clock.Now = start + LiveFeedRegistry.FrameLifetime - TimeSpan.FromSeconds(1);
        await Assert.That(registry.GetFrames([alice])).Count().IsEqualTo(1);

        clock.Now = start + LiveFeedRegistry.FrameLifetime;
        await Assert.That(registry.GetFrames([alice])).IsEmpty();
    }

    [Test]
    public async Task End_OnlyForgetsTheFrameForThatSession()
    {
        var registry = new LiveFeedRegistry(new ManualTimeProvider(start));
        var alice = Guid.NewGuid();
        var current = Guid.NewGuid();
        registry.Publish(FrameFor(alice, current, start));

        registry.End(alice, Guid.NewGuid());
        await Assert.That(registry.GetFrames([alice])).Count().IsEqualTo(1);

        registry.End(alice, current);
        await Assert.That(registry.GetFrames([alice])).IsEmpty();
    }

    [Test]
    public async Task SetWatches_ReturnsTheUsersNoLongerWatched()
    {
        var registry = new LiveFeedRegistry(new ManualTimeProvider(start));
        var alice = Guid.NewGuid();
        var bob = Guid.NewGuid();
        registry.SetWatches("c1", [new("a", alice), new("b", bob)]);

        var stopped = registry.SetWatches("c1", [new("b", bob)]);

        await Assert.That(stopped).IsEquivalentTo(new[] { alice });
    }

    [Test]
    public async Task Revoke_ReturnsOnlyConnectionsWatchingThroughThatSecret()
    {
        var registry = new LiveFeedRegistry(new ManualTimeProvider(start));
        var alice = Guid.NewGuid();
        registry.SetWatches("c1", [new("a1", alice)]);
        registry.SetWatches("c2", [new("a2", alice)]);

        var stopped = registry.Revoke(alice, "a1");

        await Assert.That(stopped).IsEquivalentTo(new[] { "c1" });
        await Assert.That(registry.Revoke(alice, "a1")).IsEmpty();
    }
}
