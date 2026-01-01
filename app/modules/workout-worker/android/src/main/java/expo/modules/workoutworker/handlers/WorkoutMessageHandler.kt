package expo.modules.workoutworker.handlers

import LiftLog.Ui.Models.WorkoutMessage.WorkoutMessageOuterClass

/**
 * Interface for handling specific workout event types.
 * Each implementation is responsible for a single event type.
 */
interface WorkoutMessageHandler {
    /**
     * Returns true if this handler can process the given event.
     */
    fun canHandle(event: WorkoutMessageOuterClass.WorkoutMessage): Boolean

    /**
     * Handle the event. Only called if [canHandle] returned true.
     */
    suspend fun handle(
        event: WorkoutMessageOuterClass.WorkoutMessage,
        dispatch: (type: String, event: WorkoutMessageOuterClass.WorkoutMessage) -> Unit
    )

    fun onDestroy() {}
}
