package expo.modules.workoutworker.utils

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

/**
 * A utility class that executes a callback repeatedly at a fixed interval.
 *
 * @param scope The CoroutineScope to launch the timer in. The timer will be cancelled
 *              when this scope is cancelled.
 * @param intervalMs The interval between ticks in milliseconds. Defaults to 500ms.
 * @param onTick The callback to execute on each tick. Can be updated via [updateCallback].
 */
class RepeatingTimerAction(
    private val scope: CoroutineScope,
    private var onTick: suspend () -> Unit,
    private val intervalMs: Long = 500L,
) {
    @Volatile
    private var job: Job? = null

    private var destroyed = false

    /**
     * Whether the timer is currently running.
     */
    val isRunning: Boolean
        get() = job?.isActive == true

    /**
     * Starts the repeating timer. If already running, this is a no-op.
     */
    fun start() {
        guardDestroyed()
        if (isRunning) return

        job = scope.launch {
            while (isActive) {
                onTick()
                delay(intervalMs)
            }
        }
    }

    /**
     * Stops the repeating timer. Safe to call multiple times.
     */
    fun stop() {
        guardDestroyed()
        job?.cancel()
        job = null
    }

    /**
     * Updates the callback to be executed on each tick.
     * Takes effect on the next tick.
     *
     * @param newCallback The new callback to execute.
     */
    fun updateCallback(newCallback: suspend () -> Unit) {
        guardDestroyed()
        onTick = newCallback
    }

    fun destroy() {
        guardDestroyed()
        stop()
        onTick = {}
        destroyed = true
    }

    private fun guardDestroyed(){
        if(destroyed){
            throw UnsupportedOperationException("Timer destroyed")
        }
    }
}
