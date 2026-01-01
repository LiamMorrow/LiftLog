package expo.modules.workoutworker

import LiftLog.Ui.Models.WorkoutMessage.WorkoutMessageOuterClass
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import androidx.core.net.toUri

object WorkoutConstants {
    const val BUNDLE_EXTRA_MESSAGE_KEY = "expo.modules.workoutworker.MESSAGE"

    const val SESSION_PAGE_URI = "liftlog://session"

    fun Context.getLaunchAppAtWorkoutPagePendingIntent(
        message: WorkoutMessageOuterClass.WorkoutMessage? = null
    ): PendingIntent {

        val intent = Intent(Intent.ACTION_MAIN).apply {
            component = android.content.ComponentName(
                packageName,
                "$packageName.MainActivity"
            )
            addCategory(Intent.CATEGORY_LAUNCHER)


            // When we set data (the uri), the extras get cleared on receive of the intent
            // So we need one or the other
            if (message != null) {
                putExtra(
                    WorkoutConstants.BUNDLE_EXTRA_MESSAGE_KEY,
                    message.toByteArray()
                )
            } else {
                data = WorkoutConstants.SESSION_PAGE_URI.toUri()
            }

            addFlags(
                Intent.FLAG_ACTIVITY_NEW_TASK or
                        Intent.FLAG_ACTIVITY_CLEAR_TOP or
                        Intent.FLAG_ACTIVITY_SINGLE_TOP
            )
        }

        return PendingIntent.getActivity(
            this,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

}
