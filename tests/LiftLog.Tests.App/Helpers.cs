using LiftLog.Lib;

namespace LiftLog.Tests;

public static class Helpers
{
    public static ImmutableListValue<T> Repeat<T>(this T item, int times)
    {
        return Enumerable.Repeat(item, times).ToImmutableList();
    }
}
