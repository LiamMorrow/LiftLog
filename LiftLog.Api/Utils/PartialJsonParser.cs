using System.Diagnostics.CodeAnalysis;
using System.Text.Json;

namespace LiftLog.Api.Utils;

public static class PartialJsonParser
{
    private static readonly JsonSerializerOptions JsonSerializerOptions = new JsonSerializerOptions(
        JsonSerializerOptions.Default
    )
    {
        AllowOutOfOrderMetadataProperties = true,
        PropertyNameCaseInsensitive = true,
    };

    /// <summary>
    /// Attempts to parse incomplete JSON by completing missing brackets and braces
    /// </summary>
    /// <typeparam name="T">The type to deserialize to</typeparam>
    /// <param name="incompleteJson">The potentially incomplete JSON string</param>
    /// <param name="result">The deserialized result if successful</param>
    /// <returns>True if parsing was successful, false otherwise</returns>
    public static bool TryParsePartialJson<T>(
        string incompleteJson,
        [NotNullWhen(true)] out T? result
    )
        where T : class
    {
        result = null;

        if (string.IsNullOrWhiteSpace(incompleteJson))
            return false;

        // First try parsing the JSON as-is
        try
        {
            result = JsonSerializer.Deserialize<T>(incompleteJson, JsonSerializerOptions);
            return result is not null;
        }
        catch { }

        // If that fails, try to complete the JSON structure
        try
        {
            var completedJson = CompleteJsonStructure(incompleteJson);
            result = JsonSerializer.Deserialize<T>(completedJson, JsonSerializerOptions);
            return result is not null;
        }
        catch
        {
            return false;
        }
    }

    private static string CompleteJsonStructure(string incompleteJson)
    {
        var closersStack = new Stack<char>();
        bool inString = false;
        bool escape = false;

        for (int i = 0; i < incompleteJson.Length; i++)
        {
            char c = incompleteJson[i];

            if (escape)
            {
                escape = false;
                continue;
            }

            if (c == '\\')
            {
                escape = true;
                continue;
            }

            if (c == '"')
            {
                inString = !inString;
                continue;
            }

            if (inString)
                continue;

            if (c == '{' || c == '[')
            {
                closersStack.Push(c);
            }
            else if (c == '}')
            {
                if (closersStack.Count > 0 && closersStack.Peek() == '{')
                    closersStack.Pop();
            }
            else if (c == ']')
            {
                if (closersStack.Count > 0 && closersStack.Peek() == '[')
                    closersStack.Pop();
            }
        }

        // Build the completed JSON string
        var completedJson = incompleteJson + (inString ? '"' : "");

        while (closersStack.Count > 0)
        {
            var opener = closersStack.Pop();
            completedJson += opener == '{' ? '}' : ']';
        }

        return completedJson;
    }
}
