using SimpleGymTracker.Lib.Models;
using static SimpleGymTracker.Lib.Util;

namespace SimpleGymTracker.Lib
{
  public static partial class Plans
  {
    public static ImmutableListSequence<WorkoutPlan> BuiltInPlans => ListOf(s_stronglifts, s_strongliftss);
  }
}
