using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SimpleGymTracker.Lib.Models;

namespace SimpleGymTracker.Lib.Store
{
    public interface IProgressStore
    {
        ValueTask<WorkoutDayDao?> GetCurrentDayAsync();

        ValueTask SaveCurrentDayAsync(WorkoutDayDao day);

        ValueTask ClearCurrentDayAsync();

        IAsyncEnumerable<WorkoutDayDao> GetAllWorkoutDaysAsync();

        ValueTask<WorkoutDay?> GetWorkoutDayAsync(Guid id);

        IAsyncEnumerable<WorkoutDayDao> GetWorkoutDaysForPlanAsync(WorkoutPlan plan);

        ValueTask SaveCompletedDayAsync(WorkoutDayDao dao);
    }
}
