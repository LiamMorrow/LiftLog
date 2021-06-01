using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;
using System.Text.Json.Serialization;
using SimpleGymTracker.Lib.Serialization;

namespace SimpleGymTracker.Lib
{
  /**
  * An implementation of immutable list with value semantics.
  */
  [JsonConverter(typeof(ImmutableListSequenceJsonConverter))]
  public sealed class ImmutableListSequence<T> : IImmutableList<T>
  {
    public ImmutableListSequence(ImmutableList<T> items)
    {
      Items = items;
    }

    public ImmutableListSequence(List<T> items)
    {
      Items = items.ToImmutableList();
    }

    private ImmutableList<T> Items { get; }

    public int Count => ((IReadOnlyCollection<T>)Items).Count;

    public T this[int index] => ((IReadOnlyList<T>)Items)[index];

    public static implicit operator ImmutableListSequence<T>(ImmutableList<T> source)
    {
      return new ImmutableListSequence<T>(source);
    }

    public override int GetHashCode()
    {
      return Items.Aggregate(0, HashCode.Combine);
    }

    public override bool Equals(object? obj)
    {
      if (obj is ImmutableListSequence<T> second)
      {
        return Items.SequenceEqual(second.Items);
      }

      return false;
    }

    public override string ToString()
    {
      return $"[{string.Join(",", Items.Select(x => x?.ToString() ?? "null"))}]";
    }

    /// <inheritdoc/>
    public int IndexOf(T value)
    {
      return Items.IndexOf(value);
    }

    /// <inheritdoc/>
    public ImmutableList<T> SetItem(int index, T value)
    {
      return Items.SetItem(index, value);
    }

    IImmutableList<T> IImmutableList<T>.Add(T value)
    {
      return ((IImmutableList<T>)Items).Add(value);
    }

    IImmutableList<T> IImmutableList<T>.AddRange(IEnumerable<T> items)
    {
      return ((IImmutableList<T>)Items).AddRange(items);
    }

    IImmutableList<T> IImmutableList<T>.Clear()
    {
      return ((IImmutableList<T>)Items).Clear();
    }

    int IImmutableList<T>.IndexOf(T item, int index, int count, IEqualityComparer<T>? equalityComparer)
    {
      return ((IImmutableList<T>)Items).IndexOf(item, index, count, equalityComparer);
    }

    IImmutableList<T> IImmutableList<T>.Insert(int index, T element)
    {
      return ((IImmutableList<T>)Items).Insert(index, element);
    }

    IImmutableList<T> IImmutableList<T>.InsertRange(int index, IEnumerable<T> items)
    {
      return ((IImmutableList<T>)Items).InsertRange(index, items);
    }

    int IImmutableList<T>.LastIndexOf(T item, int index, int count, IEqualityComparer<T>? equalityComparer)
    {
      return ((IImmutableList<T>)Items).LastIndexOf(item, index, count, equalityComparer);
    }

    IImmutableList<T> IImmutableList<T>.Remove(T value, IEqualityComparer<T>? equalityComparer)
    {
      return ((IImmutableList<T>)Items).Remove(value, equalityComparer);
    }

    IImmutableList<T> IImmutableList<T>.RemoveAll(Predicate<T> match)
    {
      return ((IImmutableList<T>)Items).RemoveAll(match);
    }

    IImmutableList<T> IImmutableList<T>.RemoveAt(int index)
    {
      return ((IImmutableList<T>)Items).RemoveAt(index);
    }

    IImmutableList<T> IImmutableList<T>.RemoveRange(IEnumerable<T> items, IEqualityComparer<T>? equalityComparer)
    {
      return ((IImmutableList<T>)Items).RemoveRange(items, equalityComparer);
    }

    IImmutableList<T> IImmutableList<T>.RemoveRange(int index, int count)
    {
      return ((IImmutableList<T>)Items).RemoveRange(index, count);
    }

    IImmutableList<T> IImmutableList<T>.Replace(T oldValue, T newValue, IEqualityComparer<T>? equalityComparer)
    {
      return ((IImmutableList<T>)Items).Replace(oldValue, newValue, equalityComparer);
    }

    IImmutableList<T> IImmutableList<T>.SetItem(int index, T value)
    {
      return ((IImmutableList<T>)Items).SetItem(index, value);
    }

    public IEnumerator<T> GetEnumerator()
    {
      return ((IEnumerable<T>)Items).GetEnumerator();
    }

    IEnumerator IEnumerable.GetEnumerator()
    {
      return ((IEnumerable)Items).GetEnumerator();
    }
  }
}
