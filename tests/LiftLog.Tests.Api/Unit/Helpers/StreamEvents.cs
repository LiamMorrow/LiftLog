using System.Text.Json;
using Anthropic.Models.Messages;

namespace LiftLog.Tests.Api.Unit.Helpers;

/// <summary>
/// Builds <see cref="RawMessageStreamEvent"/>s from raw JSON matching Anthropic's
/// streaming SSE wire format — the same shape the SDK materializes from a real
/// response, so the planner's union handling is exercised against realistic input.
/// </summary>
public static class StreamEvents
{
    private static JsonElement El(object value) => JsonSerializer.SerializeToElement(value);

    public static RawMessageStreamEvent ToolUseStart(string id, string name, long index = 0) =>
        // Built via FromRawUnchecked so RawData is populated and .Value is NOT
        // materialized — this exercises the planner's raw-JSON fallback path (the
        // content-block union does not lazily resolve its .Value).
        RawContentBlockStartEvent.FromRawUnchecked(
            new Dictionary<string, JsonElement>
            {
                ["type"] = El("content_block_start"),
                ["index"] = El(index),
                ["content_block"] = El(
                    new
                    {
                        type = "tool_use",
                        id,
                        name,
                        input = new { },
                    }
                ),
            }
        );

    public static RawMessageStreamEvent TextDelta(string text, long index = 0) =>
        RawContentBlockDeltaEvent.FromRawUnchecked(
            new Dictionary<string, JsonElement>
            {
                ["type"] = El("content_block_delta"),
                ["index"] = El(index),
                ["delta"] = El(new { type = "text_delta", text }),
            }
        );

    public static RawMessageStreamEvent InputJsonDelta(string partialJson, long index = 0) =>
        RawContentBlockDeltaEvent.FromRawUnchecked(
            new Dictionary<string, JsonElement>
            {
                ["type"] = El("content_block_delta"),
                ["index"] = El(index),
                ["delta"] = El(new { type = "input_json_delta", partial_json = partialJson }),
            }
        );

    public static RawMessageStreamEvent BlockStop(long index = 0) =>
        RawContentBlockStopEvent.FromRawUnchecked(
            new Dictionary<string, JsonElement>
            {
                ["type"] = El("content_block_stop"),
                ["index"] = El(index),
            }
        );
}
