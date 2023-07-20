using LiftLog.Lib.Models;
using LiftLog.Ui.Store.CurrentSession;

namespace LiftLog.Ui.Services;

public interface INotificationService
{
    Task ScheduleNextSetNotificationAsync(SessionTarget target, RecordedExercise exercise);

    Task CancelNextSetNotificationAsync();
}
