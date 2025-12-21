using System.Text.Json;
using System.Text.Json.Serialization;

namespace LiftLog.Lib.Serialization;

// source: https://github.com/Blazored/LocalStorage/blob/main/src/Blazored.LocalStorage/JsonConverters/TimespanJsonConverter.cs
/// <summary>
/// The new Json.NET doesn't support Timespan at this time
/// https://github.com/dotnet/corefx/issues/38641
/// </summary>
public partial class TimeSpanJsonConverter : JsonConverter<TimeSpan>
{
    /// <summary>
    /// Format: Days.Hours:Minutes:Seconds:Milliseconds
    /// </summary>
    public const string TimeSpanFormatString = @"d\.hh\:mm\:ss\:FFF";

    public override TimeSpan Read(
        ref Utf8JsonReader reader,
        Type typeToConvert,
        JsonSerializerOptions options
    )
    {
        var s = reader.GetString()?.Trim();
        if (string.IsNullOrWhiteSpace(s))
        {
            return TimeSpan.Zero;
        }

        return TimeSpan.ParseExact(s, TimeSpanFormatString, null);
    }

    public override void Write(Utf8JsonWriter writer, TimeSpan value, JsonSerializerOptions options)
    {
        var timespanFormatted = $"{value.ToString(TimeSpanFormatString)}";
        writer.WriteStringValue(timespanFormatted);
    }
}
