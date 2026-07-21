package expo.modules.workoutworker.handlers


import android.annotation.SuppressLint
import android.app.Notification
import android.util.Log
import com.limajuice.liftlog.DistanceCardioTarget
import com.limajuice.liftlog.FixedRepsConfig
import com.limajuice.liftlog.PerSetRepsConfig
import com.limajuice.liftlog.RangeRepsConfig
import com.limajuice.liftlog.RecordedCardioExercise
import com.limajuice.liftlog.RecordedCardioExerciseSet
import com.limajuice.liftlog.RecordedWeightedExercise
import com.limajuice.liftlog.RepsConfig
import com.limajuice.liftlog.TimeCardioTarget
import com.limajuice.liftlog.Translations
import com.limajuice.liftlog.Weight
import com.limajuice.liftlog.WeightUnit
import com.limajuice.liftlog.WorkoutMessage
import com.limajuice.liftlog.WorkoutUpdatedEvent
import expo.modules.workoutworker.utils.RepeatingTimerAction
import expo.modules.workoutworker.utils.WorkoutNotificationManager
import kotlinx.coroutines.MainScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.time.Clock
import kotlin.time.Duration
import kotlin.time.DurationUnit.SECONDS
import kotlin.time.ExperimentalTime
import kotlin.time.toDuration


class WorkoutUpdatedHandler(
    private val notificationManager: WorkoutNotificationManager
) : WorkoutMessageHandler {
    override fun canHandle(event: WorkoutMessage): Boolean {
        return event.payload is WorkoutUpdatedEvent && event.appConfiguration.notificationsEnabled
    }

    val timer = RepeatingTimerAction(MainScope(), {})

    // Every workout update restarts the timer callback, so "have we announced this target yet" has to
    // outlive it - otherwise a set left running past its target re-announces on every update.
    private var announcedCardioTarget: Pair<Int, Int>? = null

    override suspend fun handle(
        event: WorkoutMessage,
        dispatch: (type: String, event: WorkoutMessage) -> Unit
    ) {
        try {
            val workoutUpdatedEvent = event.payload as WorkoutUpdatedEvent

            when {
                workoutUpdatedEvent.restTimerInfo != null -> showRestTimerNotification(event.translations, workoutUpdatedEvent)
                workoutUpdatedEvent.cardioTimerInfo != null -> showCardioTimerNotification(event.translations, workoutUpdatedEvent)
                workoutUpdatedEvent.currentExerciseDetails != null -> showCurrentExerciseNotification(
                    event.translations,
                    workoutUpdatedEvent
                )

                else -> showFinishedNotification(event.translations, workoutUpdatedEvent)
            }
        } catch (e: Exception) {
            Log.e("WorkoutUpdatedHandler", "Failed to handle workout updated event", e)
        }
    }

    private fun showFinishedNotification(translations: Translations, event: WorkoutUpdatedEvent) {
        // We should not be in a timer anymore
        timer.stop()

        val messageTemplate: String =
            translations.workoutPersistentNotificationFinishedMessage
        val message = messageTemplate.replace(
            "\$WEIGHT$", formatWeight(event.totalWeightLifted, truncateDecimals = true)
        ).replace(
            "\$TIME$", formatDuration(Duration.parseIsoString(event.workoutDuration))
        )

        val notifBuilder = notificationManager.createWorkoutNotificationBuilder()
            .setContentText(message)
        notificationManager.notifyPersistent(notifBuilder.build())
    }

    private fun showCurrentExerciseNotification(translations: Translations, event: WorkoutUpdatedEvent) {
        // We should not be in a timer anymore
        timer.stop()

        val notifBuilder = notificationManager.createWorkoutNotificationBuilder()
            .setContentText("${getCurrentExerciseMessage(translations, event)}\n${translations.workoutPersistentNotificationStartNowMessage}")
        notificationManager.notifyPersistent(notifBuilder.build())
    }

    @OptIn(ExperimentalTime::class)
    private fun showRestTimerNotification(
        translations: Translations,
        workoutUpdatedEvent: WorkoutUpdatedEvent,
    ) {

        val restTimerInfo = workoutUpdatedEvent.restTimerInfo ?:return
        fun getProgress(): Long {
            val timeStartSecs = restTimerInfo.startedAt.epochSeconds
            val now = Clock.System.now().epochSeconds
            return now - timeStartSecs
        }

        val currentExerciseMessage = getCurrentExerciseMessage(translations, workoutUpdatedEvent)
        var previousProgress = getProgress()
        timer.updateCallback {
            val timeStartSecs = restTimerInfo.startedAt.epochSeconds
            val timePartiallyEndSecs = restTimerInfo.partiallyEndAt.epochSeconds
            val timeEndSecs = restTimerInfo.endAt.epochSeconds
            val progress = getProgress()
            val now = Clock.System.now().epochSeconds
            val partialProgressMax = timePartiallyEndSecs - timeStartSecs
            val fullProgressMax = timeEndSecs - timeStartSecs

            // max
            val progressMax = if (now < timePartiallyEndSecs)
                partialProgressMax else
                fullProgressMax


            val restNotif: Notification? = when {
                partialProgressMax in (previousProgress + 1)..progress && partialProgressMax != 0L -> notificationManager.createRestNotificationBuilder()
                    .setContentTitle(translations.workoutPersistentNotificationMinRestOverMessage)
                    .build()

                fullProgressMax in (previousProgress + 1)..progress && fullProgressMax != 0L -> notificationManager.createRestNotificationBuilder()
                    .setContentTitle(translations.workoutPersistentNotificationMaxRestOverMessage)
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
                now < timePartiallyEndSecs -> translations.workoutPersistentNotificationRestBreakMessage
                now in timePartiallyEndSecs..timeEndSecs -> translations.workoutPersistentNotificationStartSoonMessage
                else -> translations.workoutPersistentNotificationStartNowMessage
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
        translations: Translations,
        workoutUpdatedEvent: WorkoutUpdatedEvent,
    ) {
        val cardioTimerInfo = workoutUpdatedEvent.cardioTimerInfo?:return
        val currentExerciseMessage = getCurrentExerciseMessage(translations, workoutUpdatedEvent)
        if(cardioTimerInfo.currentBlockStartTime == null){
            return
        }

        // Nothing knows when a distance target will be met, so only a time target can be counted down to.
        val target = getRunningCardioSet(workoutUpdatedEvent)?.blueprint?.target
        val targetSecs = (target as? TimeCardioTarget)?.let {
            Duration.parseIsoString(it.value).toLong(SECONDS)
        }

        val setKey = cardioTimerInfo.exerciseIndex.toInt() to cardioTimerInfo.setIndex.toInt()
        timer.updateCallback {
            val currentDuration = Duration.parseIsoString(cardioTimerInfo.currentDuration)
            val timeStartSecs =
                cardioTimerInfo.currentBlockStartTime.epochSeconds - currentDuration.toInt(SECONDS)
            val now = Clock.System.now().epochSeconds
            val elapsedSecs = now - timeStartSecs

            val reached = targetSecs != null && elapsedSecs >= targetSecs
            if (reached && announcedCardioTarget != setKey) {
                announcedCardioTarget = setKey
                notificationManager.notifyRest(
                    notificationManager.createRestNotificationBuilder()
                        .setContentTitle(translations.workoutPersistentNotificationCardioTargetReachedMessage)
                        .build()
                )
                MainScope().launch {
                    delay(10_000)
                    notificationManager.clearRestNotification()
                }
            }

            val timeMessage = when {
                targetSecs == null -> formatDuration(elapsedSecs.toDuration(SECONDS))
                reached -> "+${formatDuration((elapsedSecs - targetSecs).toDuration(SECONDS))}"
                else -> formatDuration((targetSecs - elapsedSecs).toDuration(SECONDS))
            }

            var notifBuilder =
                notificationManager.createWorkoutNotificationBuilder()
                    .setContentText(currentExerciseMessage)
                    .setSubText(timeMessage)
            if (targetSecs != null && !reached) {
                notifBuilder = notifBuilder.setProgress(targetSecs.toInt(), elapsedSecs.toInt(), false)
            }

            notificationManager.notifyPersistent(notifBuilder.build())
        }
        timer.start()
    }

    private fun getRunningCardioSet(event: WorkoutUpdatedEvent): RecordedCardioExerciseSet? {
        val cardioTimerInfo = event.cardioTimerInfo ?: return null
        val exercise = event.workout.recordedExercises
            .getOrNull(cardioTimerInfo.exerciseIndex.toInt()) as? RecordedCardioExercise ?: return null
        return exercise.sets.getOrNull(cardioTimerInfo.setIndex.toInt())
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

    private fun getCurrentExerciseMessage(translations: Translations, event: WorkoutUpdatedEvent): String {

        val currentExercise =
            event.currentExerciseDetails?.exercise
        val messageTemplate = translations.workoutPersistentNotificationCurrentExerciseMessage

        val weightedExercise = event.currentExerciseDetails?.exercise as? RecordedWeightedExercise?
        val nextSetIndex = weightedExercise?.potentialSets?.indexOfFirst { it.set == null }?.takeIf { it >= 0 }
        val nextSet = nextSetIndex?.let { weightedExercise.potentialSets.getOrNull(it) }

        fun getCardioTarget(): String {
            val set = getRunningCardioSet(event) ?: run {
                val currentExercise = event.currentExerciseDetails ?: return ""
                val exercise = currentExercise.exercise as? RecordedCardioExercise? ?: return ""
                exercise.sets.getOrNull(currentExercise.setIndex.toInt()) ?: return ""
            }
            return when (val cardioTarget = set.blueprint.target) {
                is TimeCardioTarget -> formatDuration(Duration.parseIsoString(cardioTarget.value))

                is DistanceCardioTarget -> "${cardioTarget.value.value} ${cardioTarget.value.unit}"
                else -> ""
            }
        }

        return when {
            event.currentExerciseDetails == null -> ""
            currentExercise is RecordedWeightedExercise -> messageTemplate.replace(
                "\$EXERCISE_DESCRIPTOR$", "${currentExercise.blueprint.name} - ${
                    formatRepsConfig(currentExercise.blueprint.repsConfig, nextSetIndex ?: 0)
                }${
                    if (nextSet?.weight != null) "x${formatWeight(nextSet.weight)}" else ""
                }"
            )

            currentExercise is RecordedCardioExercise-> messageTemplate.replace(
                "\$EXERCISE_DESCRIPTOR$", "${currentExercise.blueprint.name} - ${getCardioTarget()}"
            )

            else -> ""
        }
    }

    private fun formatRepsTarget(min: Long, max: Long): String {
        return if (min == max) "$max" else "$min–$max"
    }

    private fun formatRepsConfig(repsConfig: RepsConfig, setIndex: Int): String {
        return when (repsConfig) {
            is FixedRepsConfig -> "${repsConfig.reps}"
            is RangeRepsConfig -> formatRepsTarget(repsConfig.min, repsConfig.max)
            is PerSetRepsConfig -> {
                val target = repsConfig.targets.getOrNull(setIndex) ?: repsConfig.targets.lastOrNull()
                target?.let { formatRepsTarget(it.min, it.max) } ?: ""
            }
            else -> ""
        }
    }

    private fun formatWeight(weight: Weight, truncateDecimals: Boolean = false): String {
        val weightValue = if (truncateDecimals) weight.value.toBigInteger().toString() else weight.value.toString()
        val shortUnit = when (weight.unit) {
            WeightUnit.kilograms -> "kg"
            WeightUnit.pounds -> "lbs"
            else -> "units"
        }
        return "$weightValue$shortUnit"
    }

    override fun onDestroy() {
        timer.destroy()
    }
}
