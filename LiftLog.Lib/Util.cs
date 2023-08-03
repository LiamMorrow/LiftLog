using System.Collections.Immutable;
using System.ComponentModel;

namespace LiftLog.Lib;
internal static class Util
{
    public static ImmutableListValue<T> ListOf<T>(params T[] items)
    {
        return new ImmutableListValue<T>(ImmutableList.Create(items));
    }

    public static ImmutableListValue<T> ListOf<T>(IEnumerable<T> items)
    {
        if (items is ImmutableListValue<T> ims)
        {
            return ims;
        }
        if (items is ImmutableList<T> il)
        {
            return new ImmutableListValue<T>(il);
        }

        return new ImmutableListValue<T>(ImmutableList.CreateRange(items));
    }
}
