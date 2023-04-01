using System.Collections.Generic;
using System.Linq;

namespace LiftLog.WebUi.Util
{
    public static class LinqExtensions
    {
        public static IEnumerable<(TSource Item, int Index)> IndexedTuples<TSource>(
            this IEnumerable<TSource> source
        )
        {
            return source.Select((item, index) => (item, index));
        }
    }
}
