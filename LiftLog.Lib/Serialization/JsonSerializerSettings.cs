using System.Text.Json;
using System.Text.Json.Serialization;

namespace LiftLog.Lib.Serialization;

public static class JsonSerializerSettings
{
    public static JsonSerializerOptions LiftLog => new JsonSerializerOptions(JsonSerializerOptions.Default)
    {
        AllowTrailingCommas = true,
        PropertyNameCaseInsensitive = true,
        Converters = {
            new JsonStringEnumConverter(),
            new TimespanJsonConverter()
        },
    };
}
