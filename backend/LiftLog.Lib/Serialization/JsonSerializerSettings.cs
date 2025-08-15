using System.Text.Json;
using System.Text.Json.Serialization;
using LiftLog.Lib.Models;

namespace LiftLog.Lib.Serialization;

public static class JsonSerializerSettings
{
    public static JsonSerializerOptions LiftLog =>
        new(JsonSerializerOptions.Default)
        {
            AllowTrailingCommas = true,
            PropertyNameCaseInsensitive = true,
            Converters =
            {
                new JsonStringEnumConverter(),
                new TimeSpanJsonConverter(),
                new ImmutableDictionaryJsonConverter(),
            },
        };
}
