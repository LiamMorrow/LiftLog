package expo.modules.workoutworker


import LiftLog.Ui.Models.WorkoutMessage.WorkoutMessageOuterClass
import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.util.Log
import expo.modules.core.interfaces.ReactActivityLifecycleListener

/**
 * Listens for intents broadcasted, largely from the notification taps
 * We can put a WorkoutMessage in the extras of an intent for it to be broadcast back to the RNModule
 */
class WorkoutWorkerLifecycleListener : ReactActivityLifecycleListener {

    /**
     * This will be triggered if the app is not running,
     * and is started from clicking on a notification.
     */
    override fun onCreate(activity: Activity, savedInstanceState: Bundle?) {
        Log.d("WorkoutWorkerLifecycleListener", "onCreate")
        val extras = activity.intent?.extras ?: return
        // only actions that have opensAppToForeground: true are handled here
        handleExtras(extras)
    }

    /**
     * This will be triggered if the app is running and in the background,
     * and the user clicks on a notification to open the app.
     */
    override fun onNewIntent(intent: Intent): Boolean {
        Log.d("WorkoutWorkerLifecycleListener", "onNewIntent")
        val extras = intent.extras ?: return false
        handleExtras(extras)
        return false
    }

    private fun handleExtras(bun: Bundle) {
        val hasMessage = bun.containsKey(WorkoutConstants.BUNDLE_EXTRA_MESSAGE_KEY)
        Log.d("WorkoutWorkerLifecycleListener", "Got intent. Has message:$hasMessage")
        if (hasMessage) {
            val decoded = WorkoutMessageOuterClass.WorkoutMessage.parseFrom(
                bun.getByteArray(
                    WorkoutConstants.BUNDLE_EXTRA_MESSAGE_KEY
                )
            )
            WorkoutWorkerModule.broadcastMessage(decoded)
        }
    }
}
