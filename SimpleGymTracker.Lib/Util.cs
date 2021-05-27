using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SimpleGymTracker.Lib
{
  public static class Util
  {
    public static ImmutableList<T> ListOf<T>(params T[] items)
    {
      return ImmutableList.Create(items);
    }

    public static ImmutableList<T> ListOf<T>(IEnumerable<T> items)
    {
      return ImmutableList.CreateRange(items);
    }
  }
}
