package expo.modules.workoutworker

import LiftLog.Ui.Models.WorkoutMessage.WorkoutMessageOuterClass
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.os.IBinder
import android.util.Log
import androidx.core.content.ContextCompat
import androidx.core.os.bundleOf
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class WorkoutWorkerModule : Module() {

    private var service: WorkoutWorkerService? = null
    private var pendingEvent: WorkoutMessageOuterClass.WorkoutMessage? = null

    private val connection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, binder: IBinder?) {
            Log.d("WorkoutWorker", "Service connected")
            val localBinder = binder as WorkoutWorkerService.LocalBinder
            service = localBinder.getService()

            // Set up the event dispatch callback
            service?.setEventDispatch { type, event ->
                val eventBytes = event.toByteArray()
                sendEvent("on", bundleOf("bytes" to eventBytes, "type" to type))
            }

            // Send any event that was waiting for the service to be ready
            pendingEvent?.let { event ->
                service?.enqueue(event)
                pendingEvent = null
            }
        }

        override fun onServiceDisconnected(name: ComponentName?) {
            Log.d("WorkoutWorker", "Service disconnected")
            service = null
        }
    }

    override fun definition() = ModuleDefinition {
        Name("WorkoutWorker")

        Events("on")

        OnDestroy {
            unbindIfNeeded()
        }

        Function("broadcast") { type: String, bytes: ByteArray ->
            sendEvent(
                "on", bundleOf("bytes" to bytes, "type" to type)
            )

            val event = WorkoutMessageOuterClass.WorkoutMessage.parseFrom(bytes)
            val context = appContext.reactContext ?: return@Function
            Log.d("WorkoutWorker", "Got workout event $type")

            when {
                event.hasWorkoutStartedEvent() -> {
                    if (event.appConfiguration.notificationsEnabled) {
                        // Start and bind to the service
                        val intent = Intent(context, WorkoutWorkerService::class.java)
                        ContextCompat.startForegroundService(context, intent)
                        context.bindService(intent, connection, Context.BIND_AUTO_CREATE)

                        // Store event to send once service is connected
                        pendingEvent = event
                    }
                }

                event.hasWorkoutEndedEvent() -> {
                    // Forward the event, unbind, then stop the service
                    service?.enqueue(event)
                    unbindIfNeeded()
                    val intent = Intent(context, WorkoutWorkerService::class.java)
                    context.stopService(intent)
                }

                else -> {
                    // Forward all other events to the running service
                    service?.enqueue(event)
                }
            }
        }
    }

    private fun unbindIfNeeded() {
        if (service != null) {
            try {
                appContext.reactContext?.unbindService(connection)
            } catch (e: IllegalArgumentException) {
                // Service not bound, ignore
            }
            service = null
        }
    }
}
