package expo.modules.workoutworker.handlers


import LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2OuterClass.ExerciseType.CARDIO
import LiftLog.Ui.Models.SessionBlueprintDao.SessionBlueprintDaoV2OuterClass.ExerciseType.WEIGHTED
import LiftLog.Ui.Models.Utils
import LiftLog.Ui.Models.Utils.WeightUnit.KILOGRAMS
import LiftLog.Ui.Models.Utils.WeightUnit.POUNDS
import LiftLog.Ui.Models.WorkoutMessage.WorkoutMessageOuterClass
import android.annotation.SuppressLint
import android.app.Notification
import expo.modules.workoutworker.utils.RepeatingTimerAction
import expo.modules.workoutworker.utils.WorkoutNotificationManager
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.math.BigDecimal
import kotlin.time.Clock
import kotlin.time.Duration
import kotlin.time.DurationUnit.SECONDS
import kotlin.time.ExperimentalTime
import kotlin.time.toDuration


class WorkoutUpdatedHandler(
    private val notificationManager: WorkoutNotificationManager
) : WorkoutMessageHandler {
    override fun canHandle(event: WorkoutMessageOuterClass.WorkoutMessage): Boolean {
        return event.hasWorkoutUpdatedEvent() && event.appConfiguration.notificationsEnabled
    }

    val timer = RepeatingTimerAction(MainScope(), {})

    override suspend fun handle(
        event: WorkoutMessageOuterClass.WorkoutMessage,
        dispatch: (type: String, event: WorkoutMessageOuterClass.WorkoutMessage) -> Unit
    ) {
        val workoutUpdatedEvent = event.workoutUpdatedEvent

        when {
            workoutUpdatedEvent.hasRestTimerInfo() -> showRestTimerNotification(event)
            workoutUpdatedEvent.hasCardioTimerInfo() -> showCardioTimerNotification(event)
            workoutUpdatedEvent.hasCurrentExercise() -> showCurrentExerciseNotification(event)
            else -> showFinishedNotification(event)
        }
    }

    private fun showFinishedNotification(event: WorkoutMessageOuterClass.WorkoutMessage) {
        // We should not be in a timer anymore
        timer.stop()

        val messageTemplate: String =
            event.translations.workoutPersistentNotificationFinishedMessage
        val message = messageTemplate.replace(
            "\$WEIGHT$", formatWeight(event.workoutUpdatedEvent.totalWeightLifted)
        ).replace(
            "\$TIME$", formatDuration(fromDurationDao(event.workoutUpdatedEvent.workoutDuration))
        )

        val notifBuilder = notificationManager.createWorkoutNotificationBuilder()
            .setContentText(message)
        notificationManager.notifyPersistent(notifBuilder.build())
    }

    private fun showCurrentExerciseNotification(event: WorkoutMessageOuterClass.WorkoutMessage) {
        // We should not be in a timer anymore
        timer.stop()

        val notifBuilder = notificationManager.createWorkoutNotificationBuilder()
            .setContentText("${getCurrentExerciseMessage(event)}\n${event.translations.workoutPersistentNotificationStartNowMessage}")
        notificationManager.notifyPersistent(notifBuilder.build())
    }

    @OptIn(ExperimentalTime::class)
    private fun showRestTimerNotification(
        event: WorkoutMessageOuterClass.WorkoutMessage,
    ) {
        val workoutUpdatedEvent = event.workoutUpdatedEvent

        val restTimerInfo = workoutUpdatedEvent.restTimerInfo
        val currentExerciseMessage = getCurrentExerciseMessage(event)
        var previousProgress = 0L;
        timer.updateCallback {
            val timeStartSecs = restTimerInfo.startedAt.seconds
            val timePartiallyEndSecs = restTimerInfo.partiallyEndAt.seconds
            val timeEndSecs = restTimerInfo.endAt.seconds
            val now = Clock.System.now().epochSeconds
            val progress = now - timeStartSecs
            val partialProgressMax = timePartiallyEndSecs - timeStartSecs
            val fullProgressMax = timeEndSecs - timeStartSecs

            // max
            val progressMax = if (now < timePartiallyEndSecs)
                partialProgressMax else
                fullProgressMax


            val restNotif: Notification? = when {
                partialProgressMax in (previousProgress + 1)..progress && partialProgressMax != 0L -> notificationManager.createRestNotificationBuilder()
                    .setContentTitle(event.translations.workoutPersistentNotificationMinRestOverMessage)
                    .build()

                fullProgressMax in (previousProgress + 1)..progress && fullProgressMax != 0L -> notificationManager.createRestNotificationBuilder()
                    .setContentTitle(event.translations.workoutPersistentNotificationMaxRestOverMessage)
                    .build()

                else -> null
            }
            if (restNotif != null) {
                notificationManager.notifyRest(restNotif)

                MainScope().launch {
                    delay(10_000)
                    notificationManager.clearRestNotification()
                }
            }
            @Suppress("AssignedValueIsNeverRead")
            previousProgress = progress

            val message = when {
                now < timePartiallyEndSecs -> event.translations.workoutPersistentNotificationRestBreakMessage
                now in timePartiallyEndSecs..timeEndSecs -> event.translations.workoutPersistentNotificationStartSoonMessage
                else -> event.translations.workoutPersistentNotificationStartNowMessage
            }
            val contentText = when {
                currentExerciseMessage == "" -> message
                else -> "$currentExerciseMessage\n$message"
            }
            var notifBuilder =
                notificationManager.createWorkoutNotificationBuilder()
                    .setContentText(contentText).setSubText(
                        "${formatDuration(progress.toDuration(SECONDS))}/${
                            formatDuration(
                                progressMax.toDuration(
                                    SECONDS
                                )
                            )
                        }"
                    )
            if (progress < progressMax) {
                notifBuilder = notifBuilder.setProgress(
                    progressMax.toInt(), progress.toInt(), false
                )
            }

            notificationManager.notifyPersistent(notifBuilder.build())
        }
        timer.start()
    }


    @OptIn(ExperimentalTime::class)
    private fun showCardioTimerNotification(
        event: WorkoutMessageOuterClass.WorkoutMessage,
    ) {
        val workoutUpdatedEvent = event.workoutUpdatedEvent

        val cardioTimerInfo = workoutUpdatedEvent.cardioTimerInfo
        val currentExerciseMessage = getCurrentExerciseMessage(event)
        timer.updateCallback {
            val currentDuration = fromDurationDao(cardioTimerInfo.currentDuration)
            val timeStartSecs =
                cardioTimerInfo.currentBlockStartTime.seconds - currentDuration.toInt(SECONDS)
            val now = Clock.System.now().epochSeconds
            val timeMessage = formatDuration((now - timeStartSecs).toDuration(SECONDS))
            val notifBuilder =
                notificationManager.createWorkoutNotificationBuilder()
                    .setContentText(currentExerciseMessage)
                    .setSubText(timeMessage)

            notificationManager.notifyPersistent(notifBuilder.build())
        }
        timer.start()
    }

    private fun fromDurationDao(duration: com.google.protobuf.Duration): Duration {
        // TODO dropping nanos, not a problem for our uses though
        return duration.seconds.toDuration(SECONDS)
    }

    @SuppressLint("DefaultLocale")
    private fun formatDuration(dur: Duration): String {
        return dur.toComponents { days: Long, hours: Int, minutes: Int, seconds: Int, _ ->
            when {
                days > 0 -> String.format("%d:%02d:%02d:%02d", days, hours, minutes, seconds)
                hours > 0 -> String.format("%d:%02d:%02d", hours, minutes, seconds)
                else -> String.format("%d:%02d", minutes, seconds)
            }
        }
    }

    private fun getCurrentExerciseMessage(event: WorkoutMessageOuterClass.WorkoutMessage): String {

        val currentExercise = event.workoutUpdatedEvent.currentExercise.exerciseBlueprint
        val messageTemplate = event.translations.workoutPersistentNotificationCurrentExerciseMessage

        val nextSet =
            event.workoutUpdatedEvent.currentExercise.potentialSetsList.firstOrNull { !it.hasRecordedSet() }

        val nextSetWeight: Utils.Weight? = when {
            nextSet != null -> Utils.Weight.newBuilder().setUnit(nextSet.weightUnit)
                .setValue(nextSet.weightValue).build()

            else -> null
        }

        fun getCardioTarget(): String {
            val cardioTarget = currentExercise.cardioTarget
            return when {
                cardioTarget.hasTimeValue() -> formatDuration(
                    cardioTarget.timeValue.seconds.toDuration(
                        SECONDS
                    )
                )

                else -> "${toBigDecimal(cardioTarget.distanceValue)} ${cardioTarget.distanceUnit}"
            }
        }

        return when {
            !event.workoutUpdatedEvent.hasCurrentExercise() -> ""
            currentExercise.type == WEIGHTED -> messageTemplate.replace(
                "\$EXERCISE_DESCRIPTOR$", "${currentExercise.name} - ${currentExercise.repsPerSet}${
                    if (nextSetWeight != null) "x${formatWeight(nextSetWeight)}" else ""
                }"
            )

            currentExercise.type == CARDIO -> messageTemplate.replace(
                "\$EXERCISE_DESCRIPTOR$", "${currentExercise.name} - ${getCardioTarget()}"
            )

            else -> ""
        }
    }

    private fun toBigDecimal(value: Utils.DecimalValue): BigDecimal {
        val nanoFactor = BigDecimal("1000000000")
        return BigDecimal(value.units).plus(BigDecimal(value.nanos.toLong()).divide(nanoFactor))
    }

    private fun formatWeight(weight: Utils.Weight): String {
        val weightValue = toBigDecimal(weight.value)
        val shortUnit = when (weight.unit) {
            KILOGRAMS -> "kg"
            POUNDS -> "lbs"
            else -> "units"
        }
        return "$weightValue$shortUnit"
    }

    override fun onDestroy() {
        timer.destroy()
    }
}
