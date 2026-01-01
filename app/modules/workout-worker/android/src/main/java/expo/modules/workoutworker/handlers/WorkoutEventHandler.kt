package expo.modules.workoutworker.handlers

import LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2OuterClass
import LiftLog.Ui.Models.WorkoutEvent.WorkoutEventOuterClass

/**
 * Interface for handling specific workout event types.
 * Each implementation is responsible for a single event type.
 */
interface WorkoutEventHandler {
    /**
     * Returns true if this handler can process the given event.
     */
    fun canHandle(event: WorkoutEventOuterClass.WorkoutEvent): Boolean

    /**
     * Handle the event. Only called if [canHandle] returned true.
     */
    suspend fun handle(event: WorkoutEventOuterClass.WorkoutEvent, state: SessionHistoryDaoV2OuterClass.SessionDaoV2?)
}
