using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SimpleGymTracker.Lib
{
    internal static class Util
    {
        public static ImmutableListSequence<T> ListOf<T>(params T[] items)
        {
            return new ImmutableListSequence<T>(ImmutableList.Create(items));
        }

        public static ImmutableListSequence<T> ListOf<T>(IEnumerable<T> items)
        {
            if (items is ImmutableListSequence<T> ims)
            {
                return ims;
            }
            if (items is ImmutableList<T> il)
            {
                return new ImmutableListSequence<T>(il);
            }

            return new ImmutableListSequence<T>(ImmutableList.CreateRange(items));
        }
    }
}
