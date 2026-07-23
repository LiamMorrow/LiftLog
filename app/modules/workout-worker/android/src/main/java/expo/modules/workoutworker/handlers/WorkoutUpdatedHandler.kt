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
import expo.modules.workoutworker.utils.RestWindow
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

        val notifBuilder = notificationManager.createWorkoutNotificationBuilder(promote = false)
            .setContentText(message)
        notificationManager.notifyPersistent(notifBuilder.build())
    }

    private fun showCurrentExerciseNotification(translations: Translations, event: WorkoutUpdatedEvent) {
        // We should not be in a timer anymore
        timer.stop()

        // The collapsed pill and the always-on-display outline only surface the title and the short
        // critical text, not the content text - so the exercise goes in the title and its target in
        // the critical slot, leaving the "start now" prompt for the expanded card.
        val exerciseMessage = getCurrentExerciseMessage(translations, event)
        val criticalText = getCurrentExerciseCriticalText(event)
        val notifBuilder = notificationManager.createWorkoutNotificationBuilder()
            .apply { if (exerciseMessage.isNotEmpty()) setContentTitle(exerciseMessage) }
            .apply { if (criticalText.isNotEmpty()) setShortCriticalText(criticalText) }
            .setContentText(translations.workoutPersistentNotificationStartNowMessage)
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
            // The pill counts down within the current rest window - first toward the minimum rest,
            // then between minimum and maximum - and the small icon marks which window it's in.
            val window = RestWindow.of(now, timePartiallyEndSecs, timeEndSecs)
            val windowRemaining = when (window) {
                RestWindow.RESTING -> timePartiallyEndSecs - now
                RestWindow.READY -> timeEndSecs - now
                RestWindow.DONE -> 0L
            }
            val criticalText =
                if (windowRemaining > 0) formatDuration(windowRemaining.toDuration(SECONDS)) else ""
            val notifBuilder =
                notificationManager.createWorkoutNotificationBuilder()
                    .apply { if (currentExerciseMessage.isNotEmpty()) setContentTitle(currentExerciseMessage) }
                    .setSmallIcon(window.icon)
                    .setContentText(contentText)
                    .setShortCriticalText(criticalText)
                    .setSubText(
                        "${formatDuration(progress.toDuration(SECONDS))}/${
                            formatDuration(progressMax.toDuration(SECONDS))
                        }"
                    )
                    .setStyle(
                        notificationManager.timerProgressStyle(
                            progress = progress.toInt(),
                            max = fullProgressMax.toInt(),
                            partialThreshold = partialProgressMax.toInt().takeIf { it > 0 },
                        )
                    )

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

            val notifBuilder =
                notificationManager.createWorkoutNotificationBuilder()
                    .apply { if (currentExerciseMessage.isNotEmpty()) setContentTitle(currentExerciseMessage) }
                    .setContentText(currentExerciseMessage)
                    .setShortCriticalText(timeMessage)
                    .setSubText(timeMessage)
                    .setStyle(
                        notificationManager.timerProgressStyle(
                            progress = elapsedSecs.toInt(),
                            max = (targetSecs ?: 0L).toInt(),
                            indeterminate = targetSecs == null || reached,
                        )
                    )

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

    private fun getCardioTarget(event: WorkoutUpdatedEvent): String {
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

    // Compact, glanceable target for the always-on-display / status-bar chip, which only has room for
    // a few characters: the upcoming reps for a weighted set, or the target for a cardio set.
    private fun getCurrentExerciseCriticalText(event: WorkoutUpdatedEvent): String {
        return when (val currentExercise = event.currentExerciseDetails?.exercise) {
            is RecordedWeightedExercise -> {
                val nextSetIndex = currentExercise.potentialSets.indexOfFirst { it.set == null }.takeIf { it >= 0 } ?: 0
                formatRepsConfig(currentExercise.blueprint.repsConfig, nextSetIndex)
            }
            is RecordedCardioExercise -> getCardioTarget(event)
            else -> ""
        }
    }

    private fun getCurrentExerciseMessage(translations: Translations, event: WorkoutUpdatedEvent): String {

        val currentExercise =
            event.currentExerciseDetails?.exercise
        val messageTemplate = translations.workoutPersistentNotificationCurrentExerciseMessage

        val weightedExercise = event.currentExerciseDetails?.exercise as? RecordedWeightedExercise?
        val nextSetIndex = weightedExercise?.potentialSets?.indexOfFirst { it.set == null }?.takeIf { it >= 0 }
        val nextSet = nextSetIndex?.let { weightedExercise.potentialSets.getOrNull(it) }

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
                "\$EXERCISE_DESCRIPTOR$", "${currentExercise.blueprint.name} - ${getCardioTarget(event)}"
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
