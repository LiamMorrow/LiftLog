package expo.modules.workoutworker.handlers

import com.limajuice.liftlog.WorkoutMessage

/**
 * Interface for handling specific workout event types.
 * Each implementation is responsible for a single event type.
 */
interface WorkoutMessageHandler {
    /**
     * Returns true if this handler can process the given event.
     */
    fun canHandle(event: WorkoutMessage): Boolean

    /**
     * Handle the event. Only called if [canHandle] returned true.
     */
    suspend fun handle(
        event: WorkoutMessage,
        dispatch: (type: String, event: WorkoutMessage) -> Unit
    )

    fun onDestroy() {}
}
