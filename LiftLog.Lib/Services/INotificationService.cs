using LiftLog.Lib.Models;

namespace LiftLog.Lib.Services;

public interface INotificationService
{
    Task ScheduleNextSetNotificationAsync(RecordedExercise exercise);

    Task CancelNextSetNotificationAsync();
}
