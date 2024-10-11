using System.Collections;
using System.Collections.Immutable;
using LiftLog.Lib;

namespace System.Linq;

public static class LinqExtensions
{
    public static IEnumerable<(TSource Item, int Index)> IndexedTuples<TSource>(
        this IEnumerable<TSource> source
    )
    {
        return source.Select((item, index) => (item, index));
    }

    public static IEnumerable<T> WhereNotNull<T>(this IEnumerable<T?> source)
        where T : notnull
    {
#pragma warning disable CS8619 // Nullability of reference types in value doesn't match target type.
        return source.Where(x => x is not null);
#pragma warning restore CS8619 // Nullability of reference types in value doesn't match target type.
    }

    public static IEnumerable<T> WhereNotNull<T>(this IEnumerable<T?> source)
        where T : struct
    {
#pragma warning disable CS8619 // Nullability of reference types in value doesn't match target type.
        return source.Where(x => x is not null).Select(x => x!.Value);
#pragma warning restore CS8619 // Nullability of reference types in value doesn't match target type.
    }

    public static IEnumerable<TResult> Pairwise<TSource, TResult>(
        this IEnumerable<TSource> source,
        Func<TSource, TSource, TResult> resultSelector
    )
        where TSource : notnull
    {
        TSource previous = default!;

        using var it = source.GetEnumerator();
        if (it.MoveNext())
            previous = it.Current;

        while (it.MoveNext())
            yield return resultSelector(previous, previous = it.Current);
    }

    public static int IndexOf<TSource>(
        this IEnumerable<TSource> source,
        Func<TSource, bool> predicate
    )
    {
        var tuples = source.IndexedTuples();
        var matchingTuple = tuples
            .Where(x => predicate(x.Item))
            .Cast<(TSource?, int)>()
            .DefaultIfEmpty((default, -1));
        return matchingTuple.First().Item2;
    }

    public static async Task<ImmutableListValue<T>> ToImmutableListValueAsync<T>(
        this IAsyncEnumerable<T> source
    )
    {
        var immutableListBuilder = ImmutableList.CreateBuilder<T>();
        await foreach (var item in source)
        {
            immutableListBuilder.Add(item);
        }

        return immutableListBuilder.ToImmutable();
    }

    public static async ValueTask<ImmutableDictionary<K, V>> ToImmutableDictionaryAwaitAsync<
        T,
        K,
        V
    >(
        this IAsyncEnumerable<T> source,
        Func<T, ValueTask<K>> keySelector,
        Func<T, ValueTask<V>> valueSelector
    )
        where K : notnull
    {
        var immutableDictionaryBuilder = ImmutableDictionary.CreateBuilder<K, V>();
        await foreach (var item in source)
        {
            var key = keySelector(item);
            var value = valueSelector(item);
            immutableDictionaryBuilder.Add(await key, await value);
        }

        return immutableDictionaryBuilder.ToImmutable();
    }

    public static async ValueTask<ImmutableDictionary<K, V>> ToImmutableDictionaryAwaitAsync<
        T,
        K,
        V
    >(
        this IAsyncEnumerable<T> source,
        Func<T, ValueTask<K>> keySelector,
        Func<T, ValueTask<V>> valueSelector,
        IEqualityComparer<K> keyComparer
    )
        where K : notnull
    {
        var immutableDictionaryBuilder = ImmutableDictionary.CreateBuilder<K, V>(keyComparer);
        await foreach (var item in source)
        {
            var key = keySelector(item);
            var value = valueSelector(item);
            immutableDictionaryBuilder.Add(await key, await value);
        }

        return immutableDictionaryBuilder.ToImmutable();
    }
}
