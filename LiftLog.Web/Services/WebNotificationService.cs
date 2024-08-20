using System.Collections.Concurrent;
using LiftLog.Lib.Models;
using LiftLog.Ui.Store.CurrentSession;
using INotificationService = LiftLog.Ui.Services.INotificationService;

namespace LiftLog.Web.Services;

public class WebNotificationService() : INotificationService
{
    private static readonly NotificationHandle NextSetNotificationHandle = new NotificationHandle(
        "NEXT_SET"
    );

    private readonly ConcurrentDictionary<
        NotificationHandle,
        CancellationTokenSource
    > _scheduledNotifications = new();

    public async Task ScheduleNextSetNotificationAsync(
        SessionTarget target,
        RecordedExercise exercise
    )
    {
        var rest = exercise switch
        {
            { LastRecordedSet: not null } => exercise.LastRecordedSet?.Set?.RepsCompleted
            == exercise.Blueprint.RepsPerSet
                ? exercise.Blueprint.RestBetweenSets.MinRest
                : exercise.Blueprint.RestBetweenSets.FailureRest,
            _ => TimeSpan.Zero,
        };
        if (rest != TimeSpan.Zero)
        {
            await ScheduleNotificationAsync(
                NextSetNotificationHandle,
                DateTime.Now.Add(rest),
                "Rest Over",
                "Start your next set now!"
            );
        }
    }

    public Task CancelNextSetNotificationAsync()
    {
        return ClearNotificationAsync(NextSetNotificationHandle);
    }

    private Task ClearNotificationAsync(NotificationHandle handle)
    {
        if (_scheduledNotifications.TryGetValue(handle, out var cancellation))
        {
            cancellation.Cancel();
        }

        return Task.CompletedTask;
    }

    private async Task ScheduleNotificationAsync(
        NotificationHandle handle,
        DateTime scheduledFor,
        string title,
        string message
    )
    {
        await ClearNotificationAsync(handle);
        var source = new CancellationTokenSource();
        if (_scheduledNotifications.TryAdd(handle, source))
        {
            var timeToWait = new[] { scheduledFor - DateTime.Now, TimeSpan.Zero }.Max();
            _ = Task.Delay(timeToWait, source.Token)
                .ContinueWith(
                    (result) =>
                    {
                        if (result.IsCompletedSuccessfully)
                        {
                            Console.WriteLine($"Notification: {title} - {message}");
                        }
                    }
                );
        }
    }

    private record NotificationHandle(string Id);
}
