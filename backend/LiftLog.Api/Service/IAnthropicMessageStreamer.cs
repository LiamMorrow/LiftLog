using Anthropic;
using Anthropic.Models.Messages;

namespace LiftLog.Api.Service;

/// <summary>
/// Thin seam over <see cref="AnthropicClient"/>'s streaming message API. Exists
/// so the planner's streaming logic can be unit tested by injecting a fake that
/// yields a scripted sequence of <see cref="RawMessageStreamEvent"/> — no
/// network or API key required.
/// </summary>
public interface IAnthropicMessageStreamer
{
    IAsyncEnumerable<RawMessageStreamEvent> CreateStreaming(
        MessageCreateParams parameters,
        CancellationToken cancellationToken
    );
}

public class AnthropicMessageStreamer(AnthropicClient client) : IAnthropicMessageStreamer
{
    public IAsyncEnumerable<RawMessageStreamEvent> CreateStreaming(
        MessageCreateParams parameters,
        CancellationToken cancellationToken
    ) => client.Messages.CreateStreaming(parameters, cancellationToken);
}
