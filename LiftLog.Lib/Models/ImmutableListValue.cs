using System.Collections;
using System.Collections.Immutable;
using System.Runtime.CompilerServices;
using System.Text.Json.Serialization;
using LiftLog.Lib.Models;
using LiftLog.Lib.Serialization;

namespace LiftLog.Lib
{
    /**
  * An implementation of immutable list with value semantics.
  */
    [JsonConverter(typeof(ImmutableListValueJsonConverter))]
    [CollectionBuilder(typeof(ImmutableListValueBuilder), "Create")]
    public sealed class ImmutableListValue<T> : IImmutableList<T>
    {
        public ImmutableListValue()
        {
            Items = [];
        }

        public ImmutableListValue(ImmutableList<T> items)
        {
            Items = items;
        }

        public ImmutableListValue(List<T> items)
        {
            Items = [.. items];
        }

        public static readonly ImmutableListValue<T> Empty = [];

        // Note - This allows for setting internally.
        // It can be set during an Equals check when 2 lists are equal by sequence, but not by reference
        // When they are equal by sequence, we set this.Items = second.Items
        // Therefore, next call, we will not need to enumerate for equality
        private ImmutableList<T> Items { get; set; }

        private int? _precomputedHashcode;

        public int Count => ((IReadOnlyCollection<T>)Items).Count;

        public T this[int index] => ((IReadOnlyList<T>)Items)[index];

        public static implicit operator ImmutableListValue<T>(ImmutableList<T> source)
        {
            return new ImmutableListValue<T>(source);
        }

        public static implicit operator ImmutableList<T>(ImmutableListValue<T> source)
        {
            return source.Items;
        }

        public override int GetHashCode()
        {
            if (_precomputedHashcode != null)
            {
                return _precomputedHashcode.Value;
            }

            _precomputedHashcode = Items.Aggregate(0, HashCode.Combine);
            return _precomputedHashcode.Value;
        }

        public override bool Equals(object? obj)
        {
            if (ReferenceEquals(this, obj))
            {
                return true;
            }

            if (obj is ImmutableListValue<T> second)
            {
                if (ReferenceEquals(second.Items, Items))
                {
                    return true;
                }

                var equalsBySequence = Items.SequenceEqual(second.Items);
                if (equalsBySequence)
                {
                    // Reduces future unnecessary sequenceEquals calls - see Items definition
                    Items = second.Items;
                    return equalsBySequence;
                }
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

        public ImmutableListValue<T> Add(T value)
        {
            return new ImmutableListValue<T>(Items.Add(value));
        }

        public ImmutableListValue<T> Remove(T value)
        {
            return new ImmutableListValue<T>(Items.Remove(value));
        }

        public ImmutableListValue<T> RemoveAt(int index)
        {
            return new ImmutableListValue<T>(Items.RemoveAt(index));
        }

        IImmutableList<T> IImmutableList<T>.AddRange(IEnumerable<T> items)
        {
            return ((IImmutableList<T>)Items).AddRange(items);
        }

        IImmutableList<T> IImmutableList<T>.Clear()
        {
            return ((IImmutableList<T>)Items).Clear();
        }

        int IImmutableList<T>.IndexOf(
            T item,
            int index,
            int count,
            IEqualityComparer<T>? equalityComparer
        )
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

        int IImmutableList<T>.LastIndexOf(
            T item,
            int index,
            int count,
            IEqualityComparer<T>? equalityComparer
        )
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

        IImmutableList<T> IImmutableList<T>.RemoveRange(
            IEnumerable<T> items,
            IEqualityComparer<T>? equalityComparer
        )
        {
            return ((IImmutableList<T>)Items).RemoveRange(items, equalityComparer);
        }

        IImmutableList<T> IImmutableList<T>.RemoveRange(int index, int count)
        {
            return ((IImmutableList<T>)Items).RemoveRange(index, count);
        }

        IImmutableList<T> IImmutableList<T>.Replace(
            T oldValue,
            T newValue,
            IEqualityComparer<T>? equalityComparer
        )
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

        public ImmutableListValue<T> AddRange(IEnumerable<T> feedItems)
        {
            return new ImmutableListValue<T>(Items.AddRange(feedItems));
        }
    }
}
