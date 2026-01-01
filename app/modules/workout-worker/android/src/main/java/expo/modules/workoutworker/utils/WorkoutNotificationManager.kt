package expo.modules.workoutworker.utils

import LiftLog.Ui.Models.WorkoutMessage.WorkoutMessageOuterClass
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE
import expo.modules.workoutworker.R
import expo.modules.workoutworker.WorkoutConstants
import expo.modules.workoutworker.WorkoutWorkerService

class WorkoutNotificationManager(private val context: Context) {

    companion object {
        const val NOTIFICATION_ID = 123
        const val CHANNEL_ID = "workout_channel"
    }

    fun createInitialNotificationBuilder(): NotificationCompat.Builder {
        return NotificationCompat.Builder(context, CHANNEL_ID)
            .setContentTitle("LiftLog")
            .setForegroundServiceBehavior(FOREGROUND_SERVICE_IMMEDIATE)
            .setSmallIcon(R.drawable.fitness_center_24px)
            .setOngoing(true)
            .setSilent(true)
    }

    fun createWorkoutNotificationBuilder(translations: WorkoutMessageOuterClass.Translations): NotificationCompat.Builder {
        val finishIntent = Intent(context, WorkoutWorkerService::class.java).apply {
            action = WorkoutConstants.ACTION_FINISH_WORKOUT
        }
        val finishPendingIntent = PendingIntent.getService(
            context,
            0,
            finishIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return createInitialNotificationBuilder()
            .addAction(
                NotificationCompat.Action.Builder(
                    R.drawable.fitness_center_24px,
                    translations.workoutPersistentNotificationFinishWorkoutAction,
                    finishPendingIntent
                ).build()
            )
    }

    fun notify(notification: android.app.Notification) {
        val manager = context.getSystemService(NotificationManager::class.java)
        manager.notify(NOTIFICATION_ID, notification)
    }

    fun clearNotification() {
        val manager = context.getSystemService(NotificationManager::class.java)
        manager.cancel(NOTIFICATION_ID)
    }
}
