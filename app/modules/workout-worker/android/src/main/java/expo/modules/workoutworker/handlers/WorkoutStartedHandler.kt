package expo.modules.workoutworker.handlers


import LiftLog.Ui.Models.WorkoutMessage.WorkoutMessageOuterClass
import expo.modules.workoutworker.utils.WorkoutNotificationManager
import kotlin.time.ExperimentalTime


class WorkoutStartedHandler(
    private val notificationManager: WorkoutNotificationManager
) : WorkoutMessageHandler {
    override fun canHandle(event: WorkoutMessageOuterClass.WorkoutMessage): Boolean {
        return event.hasWorkoutStartedEvent() && event.appConfiguration.notificationsEnabled
    }

    @OptIn(ExperimentalTime::class)
    override suspend fun handle(
        event: WorkoutMessageOuterClass.WorkoutMessage,
        dispatch: (type: String, event: WorkoutMessageOuterClass.WorkoutMessage) -> Unit
    ) {

        val notifBuilder = notificationManager.createWorkoutNotificationBuilder()
            .setContentText(event.translations.workoutPersistentNotificationInProgressMessage)
        notificationManager.notifyPersistent(notifBuilder.build())
    }
}
