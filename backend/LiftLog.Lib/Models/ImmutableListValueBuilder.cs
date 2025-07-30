using System.Collections.Immutable;

namespace LiftLog.Lib.Models;

public class ImmutableListValueBuilder
{
    public static ImmutableListValue<T> Create<T>(ReadOnlySpan<T> items) =>
        ImmutableList.Create(items);
}
