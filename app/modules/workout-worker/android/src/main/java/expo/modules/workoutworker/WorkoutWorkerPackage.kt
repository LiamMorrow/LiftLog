package expo.modules.workoutworker

import android.content.Context
import expo.modules.core.interfaces.Package
import expo.modules.core.interfaces.ReactActivityLifecycleListener

/**
 * Implicitly registers the listeners for android lifecycle
 * Lets us listen for intents destined for the MainActivity
 */
class WorkoutWorkerPackage : Package {

    override fun createReactActivityLifecycleListeners(activityContext: Context): List<ReactActivityLifecycleListener?> {
        return listOf(
            WorkoutWorkerLifecycleListener()
        )
    }
}
