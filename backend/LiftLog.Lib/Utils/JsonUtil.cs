using System.Collections.Generic;
using System.Text;

namespace LiftLog.Lib.Utils;

public static class JsonUtil
{
    public static string BalanceJson(string json)
    {
        if (string.IsNullOrEmpty(json))
            return json;

        var stack = new Stack<char>();
        var result = new StringBuilder(json);

        bool inString = false;
        bool escaped = false;

        foreach (char c in json)
        {
            if (escaped)
            {
                escaped = false;
                continue;
            }

            if (c == '\\' && inString)
            {
                escaped = true;
                continue;
            }

            if (c == '"')
            {
                inString = !inString;
                continue;
            }

            if (inString)
                continue;

            switch (c)
            {
                case '{':
                    stack.Push('}');
                    break;

                case '[':
                    stack.Push(']');
                    break;

                case '}':
                case ']':
                    if (stack.Count > 0 && stack.Peek() == c)
                    {
                        stack.Pop();
                    }
                    break;
            }
        }

        // Close an unterminated string if necessary.
        if (inString)
        {
            result.Append('"');
        }

        while (stack.Count > 0)
        {
            result.Append(stack.Pop());
        }

        return result.ToString();
    }
}
