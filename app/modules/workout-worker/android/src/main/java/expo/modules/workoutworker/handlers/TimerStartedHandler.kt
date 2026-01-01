package expo.modules.workoutworker.handlers

import LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2OuterClass
import LiftLog.Ui.Models.WorkoutEvent.WorkoutEventOuterClass
import android.util.Log
import expo.modules.workoutworker.WorkoutWorkerService
import expo.modules.workoutworker.utils.RepeatingTimerAction
import kotlinx.coroutines.MainScope
import kotlin.time.Clock
import kotlin.time.Duration
import kotlin.time.DurationUnit
import kotlin.time.ExperimentalTime
import kotlin.time.Instant
import kotlin.time.toDuration


@OptIn(ExperimentalTime::class)
class TimerStartedHandler : WorkoutEventHandler {

    val timer = RepeatingTimerAction(MainScope(), {})

    override fun canHandle(event: WorkoutEventOuterClass.WorkoutEvent): Boolean {
        return event.hasTimerStarted()
    }

    override suspend fun handle(
        event: WorkoutEventOuterClass.WorkoutEvent,
        state: SessionHistoryDaoV2OuterClass.SessionDaoV2?
    ) {
        val timerStarted = event.timerStarted
        Log.d(
            "WorkoutWorker",
            "Timer Started"
        )

        val workoutWorker = WorkoutWorkerService.instance
        if (workoutWorker == null) {
            return
        }
        timer.updateCallback {
            val timeStartSecs = timerStarted.startedAt.seconds
            val timePartiallyEndSecs = timerStarted.partiallyEndAt.seconds
            val timeEndSecs = timerStarted.endAt.seconds
            val now = Clock.System.now().epochSeconds

            // max
            val progressMax = if (now < timePartiallyEndSecs) {
                timePartiallyEndSecs - timeStartSecs
            } else {
                timeEndSecs - timeStartSecs
            }
            val progress = (now - timeStartSecs)

            if (progress < progressMax) {
                workoutWorker.updateNotification(
                    workoutWorker.buildNotification()
                        .setContentText(
                            "${progress.toDuration(DurationUnit.SECONDS)}/${
                                progressMax.toDuration(
                                    DurationUnit.SECONDS
                                )
                            }"
                        )
                        .setProgress(
                            progressMax.toInt(),
                            progress.toInt(),
                            false
                        ).build()
                )
            } else {
                workoutWorker.updateNotification(
                    workoutWorker.buildNotification()
                        .setContentText("Start your set now!")
                        .build()
                )
                timer.stop()
            }

        }
        timer.start()

    }
}
