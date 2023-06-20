using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;

namespace LiftLog.Lib.Serialization;

// source: https://github.com/Blazored/LocalStorage/blob/main/src/Blazored.LocalStorage/JsonConverters/TimespanJsonConverter.cs
/// <summary>
/// The new Json.NET doesn't support Timespan at this time
/// https://github.com/dotnet/corefx/issues/38641
/// </summary>
public partial class TimespanJsonConverter : JsonConverter<TimeSpan>
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
        var s = reader.GetString();
        if (string.IsNullOrWhiteSpace(s))
        {
            return TimeSpan.Zero;
        }
        // parse when the string value is in the format 2 minutes
        if (RegexForHumanReadable().IsMatch(s))
        {
            var match = RegexForExtractingHumanReadable().Match(s);
            var number = int.Parse(match.Groups[1].Value);
            var unit = match.Groups[2].Value;
            return unit switch
            {
                "days" or "day" => TimeSpan.FromDays(number),
                "hours" or "hour" => TimeSpan.FromHours(number),
                "minutes" or "minute" => TimeSpan.FromMinutes(number),
                "seconds" or "second" => TimeSpan.FromSeconds(number),
                "milliseconds" or "millisecond" => TimeSpan.FromMilliseconds(number),
                _ => TimeSpan.ParseExact(s, TimeSpanFormatString, null)
            };
        }
        else
        {
            return TimeSpan.ParseExact(s, TimeSpanFormatString, null);
        }
    }

    public override void Write(Utf8JsonWriter writer, TimeSpan value, JsonSerializerOptions options)
    {
        var timespanFormatted = $"{value.ToString(TimeSpanFormatString)}";
        writer.WriteStringValue(timespanFormatted);
    }

    [GeneratedRegex("^\\d+\\s\\w+$")]
    private static partial Regex RegexForHumanReadable();
    [GeneratedRegex("^(\\d+)\\s(\\w+)$")]
    private static partial Regex RegexForExtractingHumanReadable();
}
