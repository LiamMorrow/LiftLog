package expo.modules.workoutworker.utils

import android.app.Notification
import android.app.NotificationManager
import android.content.Context
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE
import expo.modules.workoutworker.R
import expo.modules.workoutworker.WorkoutConstants.getLaunchAppAtWorkoutPagePendingIntent


class WorkoutNotificationManager(private val context: Context) {

    companion object {
        const val PERSISTENT_NOTIFICATION_ID = 123
        const val REST_NOTIFICATION_ID = 1234

        const val PERSISTENT_CHANNEL_ID = "workout_channel"
        const val REST_CHANNEL_ID = "rest_channel"
    }

    fun createWorkoutNotificationBuilder(): NotificationCompat.Builder {
        return NotificationCompat.Builder(context, PERSISTENT_CHANNEL_ID)
            .setContentTitle("LiftLog")
            .setForegroundServiceBehavior(FOREGROUND_SERVICE_IMMEDIATE)
            .setContentIntent(context.getLaunchAppAtWorkoutPagePendingIntent())
            .setSmallIcon(R.drawable.fitness_center_24px)
            .setOngoing(true)
            .setSilent(true)
    }

    fun createRestNotificationBuilder(): NotificationCompat.Builder {
        return NotificationCompat.Builder(context, REST_CHANNEL_ID)
            .setForegroundServiceBehavior(FOREGROUND_SERVICE_IMMEDIATE)
            .setContentIntent(context.getLaunchAppAtWorkoutPagePendingIntent())
            .setSmallIcon(R.drawable.fitness_center_24px)
            .setOngoing(false)
            .setSilent(false)
            .setOnlyAlertOnce(true)
    }


    fun notifyPersistent(notification: android.app.Notification) {
        val manager = context.getSystemService(NotificationManager::class.java)
        manager.notify(PERSISTENT_NOTIFICATION_ID, notification)
    }

    fun notifyRest(notification: Notification) {
        val manager = context.getSystemService(NotificationManager::class.java)
        manager.notify(REST_NOTIFICATION_ID, notification)

    }

    fun clearPersistentNotification() {
        val manager = context.getSystemService(NotificationManager::class.java)
        manager.cancel(PERSISTENT_NOTIFICATION_ID)
    }

    fun clearRestNotification() {
        val manager = context.getSystemService(NotificationManager::class.java)
        manager.cancel(REST_NOTIFICATION_ID)
    }
}
