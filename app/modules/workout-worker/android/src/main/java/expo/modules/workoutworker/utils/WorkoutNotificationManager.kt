package expo.modules.workoutworker.utils

import android.app.Notification
import android.app.NotificationManager
import android.content.Context
import androidx.annotation.DrawableRes
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE
import androidx.core.app.NotificationManagerCompat
import expo.modules.workoutworker.R
import expo.modules.workoutworker.WorkoutConstants.getLaunchAppAtWorkoutPagePendingIntent
import expo.modules.workoutworker.WorkoutConstants.getLiveUpdateDeleteIntent


// Which stage of a rest break the timer is in, and the small icon that marks it in the notification
// (both the promoted Live Update chip and the plain notification on pre-Android-16 devices).
enum class RestWindow(@DrawableRes val icon: Int) {
    RESTING(R.drawable.hourglass_empty_24px),   // before the minimum rest is up
    READY(R.drawable.play_arrow_24px),          // between minimum and maximum rest
    DONE(R.drawable.check_24px);                 // past the maximum rest

    companion object {
        fun of(nowSecs: Long, minRestEndSecs: Long, maxRestEndSecs: Long): RestWindow = when {
            nowSecs < minRestEndSecs -> RESTING
            nowSecs < maxRestEndSecs -> READY
            else -> DONE
        }
    }
}


class WorkoutNotificationManager(private val context: Context) {

    companion object {
        const val PERSISTENT_NOTIFICATION_ID = 123
        const val REST_NOTIFICATION_ID = 1234

        const val PERSISTENT_CHANNEL_ID = "workout_channel"
        const val REST_CHANNEL_ID = "rest_channel"
    }

    // Set once the user swipes the Live Update away; from then on we stop requesting promotion so
    // Android doesn't revoke our permission for re-posting a dismissed promoted notification.
    @Volatile
    private var promotionDismissed = false

    fun onLiveUpdateDismissed() {
        promotionDismissed = true
    }

    fun resetPromotion() {
        promotionDismissed = false
    }

    private fun canPromote(): Boolean =
        !promotionDismissed && NotificationManagerCompat.from(context).canPostPromotedNotifications()

    fun createWorkoutNotificationBuilder(promote: Boolean = true): NotificationCompat.Builder {
        return NotificationCompat.Builder(context, PERSISTENT_CHANNEL_ID)
            .setContentTitle("LiftLog")
            .setForegroundServiceBehavior(FOREGROUND_SERVICE_IMMEDIATE)
            .setContentIntent(context.getLaunchAppAtWorkoutPagePendingIntent())
            .setDeleteIntent(context.getLiveUpdateDeleteIntent())
            .setSmallIcon(R.drawable.fitness_center_24px)
            .setOngoing(true)
            .setSilent(true)
            .setOnlyAlertOnce(true)
            .setRequestPromotedOngoing(promote && canPromote())
    }

    // A promoted progress bar for the active timer. `partialThreshold` splits the bar into a min-rest
    // and max-rest segment with a point at the boundary; an indeterminate bar is used when the end is
    // unknowable (e.g. a distance cardio target) or already passed.
    fun timerProgressStyle(
        progress: Int,
        max: Int,
        partialThreshold: Int? = null,
        indeterminate: Boolean = false,
    ): NotificationCompat.ProgressStyle {
        if (indeterminate || max <= 0) {
            return NotificationCompat.ProgressStyle().setProgressIndeterminate(true)
        }
        val style = NotificationCompat.ProgressStyle().setProgress(progress.coerceIn(0, max))
        if (partialThreshold != null && partialThreshold in 1 until max) {
            style.setProgressSegments(
                listOf(
                    NotificationCompat.ProgressStyle.Segment(partialThreshold),
                    NotificationCompat.ProgressStyle.Segment(max - partialThreshold),
                )
            ).addProgressPoint(NotificationCompat.ProgressStyle.Point(partialThreshold))
        } else {
            style.setProgressSegments(listOf(NotificationCompat.ProgressStyle.Segment(max)))
        }
        return style
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
