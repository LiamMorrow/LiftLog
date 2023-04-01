using LiftLog.Lib.Models;
using static LiftLog.Lib.Util;

namespace LiftLog.Lib
{
    public static partial class Plans
    {
        public static ImmutableListSequence<WorkoutPlan> BuiltInPlans =>
            ListOf(s_stronglifts, s_strongliftss);
    }
}
