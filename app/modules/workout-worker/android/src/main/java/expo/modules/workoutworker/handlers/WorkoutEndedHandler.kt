package expo.modules.workoutworker.handlers


import LiftLog.Ui.Models.WorkoutMessage.WorkoutMessageOuterClass
import expo.modules.workoutworker.utils.WorkoutNotificationManager


class WorkoutEndedHandler(
    private val notificationManager: WorkoutNotificationManager
) : WorkoutMessageHandler {
    override fun canHandle(event: WorkoutMessageOuterClass.WorkoutMessage): Boolean {
        return event.hasWorkoutEndedEvent()
    }

    override suspend fun handle(
        event: WorkoutMessageOuterClass.WorkoutMessage,
        dispatch: (type: String, event: WorkoutMessageOuterClass.WorkoutMessage) -> Unit
    ) {
        notificationManager.clearPersistentNotification()
    }

}
