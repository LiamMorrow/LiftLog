package expo.modules.workoutworker

import LiftLog.Ui.Models.WorkoutEvent.WorkoutEventOuterClass
import android.content.Intent
import androidx.core.content.ContextCompat
import androidx.core.os.bundleOf
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class WorkoutWorkerModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("WorkoutWorker")

        Events("on")

        Function("broadcast") { type: String, bytes: ByteArray ->
            sendEvent(
                "on", bundleOf("bytes" to bytes, "type" to type)
            )

            val event = WorkoutEventOuterClass.WorkoutEvent.parseFrom(bytes)
            val context = appContext.reactContext ?: return@Function

            when {
                event.hasWorkoutStarted() -> {
                    // Start the service when workout begins
                    val intent = Intent(context, WorkoutWorkerService::class.java)
                    ContextCompat.startForegroundService(context, intent)
                    // Service will receive event once it's ready
                    WorkoutWorkerService.instance?.enqueue(event)
                }
                event.hasWorkoutEnded() -> {
                    // Forward the event, then stop the service
                    WorkoutWorkerService.instance?.enqueue(event)
                    val intent = Intent(context, WorkoutWorkerService::class.java)
                    context.stopService(intent)
                }
                else -> {
                    // Forward all other events to the running service
                    WorkoutWorkerService.instance?.enqueue(event)
                }
            }
        }
    }
}
