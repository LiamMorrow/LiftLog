using System.Runtime.CompilerServices;
using Anthropic.Models.Messages;
using LiftLog.Api.Service;

namespace LiftLog.Tests.Api.Unit.Helpers;

/// <summary>
/// Test double for <see cref="IAnthropicMessageStreamer"/> that replays a scripted
/// sequence of stream events — no network or API key. <paramref name="beforeEach"/>
/// runs before each yield (with the event index) so tests can, e.g., trigger
/// cancellation mid-stream.
/// </summary>
public class FakeAnthropicMessageStreamer(
    IReadOnlyList<RawMessageStreamEvent> events,
    Action<int>? beforeEach = null
) : IAnthropicMessageStreamer
{
    public MessageCreateParams? LastParameters { get; private set; }

    public async IAsyncEnumerable<RawMessageStreamEvent> CreateStreaming(
        MessageCreateParams parameters,
        [EnumeratorCancellation] CancellationToken cancellationToken
    )
    {
        LastParameters = parameters;
        for (var i = 0; i < events.Count; i++)
        {
            beforeEach?.Invoke(i);
            cancellationToken.ThrowIfCancellationRequested();
            yield return events[i];
            await Task.Yield();
        }
    }
}
