using System;
using LiftLog.Lib.Models;

namespace LiftLog.WebUi.Store.WorkoutSession
{
    public record WorkoutSessionState(WorkoutDayDao? DayDao);
}
