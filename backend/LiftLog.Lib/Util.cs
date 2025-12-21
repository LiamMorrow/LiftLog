using System.Collections.Immutable;

namespace LiftLog.Lib;

internal static class Util
{
    public static ImmutableList<T> ListOf<T>(params T[] items)
    {
        return ImmutableList.Create(items);
    }

    public static ImmutableList<T> ListOf<T>(IEnumerable<T> items)
    {
        if (items is ImmutableList<T> il)
        {
            return il;
        }

        return [.. items];
    }
}
