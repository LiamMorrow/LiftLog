package expo.modules.workoutworker

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.os.IBinder
import android.util.Log
import androidx.core.content.ContextCompat
import androidx.core.os.bundleOf
import com.limajuice.liftlog.WorkoutEndedEvent
import com.limajuice.liftlog.WorkoutMessage
import com.limajuice.liftlog.WorkoutStartedEvent
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.workoutworker.utils.Json
import java.lang.ref.WeakReference

class WorkoutWorkerModule : Module() {

    companion object {
        // A global list of all observers for when the module is instantiated multiple times
        private var workoutMessageReceivedObservers: MutableSet<((WorkoutMessage) -> Unit)> =
            mutableSetOf()

        fun broadcastMessage(message: WorkoutMessage) {
            workoutMessageReceivedObservers.forEach {
                it(message)
            }
        }
    }

    private var service: WorkoutWorkerService? = null
    private var pendingEvent: WorkoutMessage? = null

    // The observer for this instance of the module, used only for removing it when app stops listening
    private var workoutMessageReceivedObserver: ((WorkoutMessage) -> Unit)? =
        null

    private val connection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, binder: IBinder?) {
            Log.d("WorkoutWorker", "Service connected")
            val localBinder = binder as WorkoutWorkerService.LocalBinder
            service = localBinder.getService()

            // Set up the event dispatch callback
            service?.setEventDispatch { type, event ->
                val jsonString = Json.encodeToString(event)
                sendEvent("on", bundleOf("jsonString" to jsonString, "type" to type))
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

        OnStartObserving("on") {
            // When the JS starts listening to "on", register this module's observer
            // Other parts of the kotlin api (such as intent listeners) can then broadcast
            // by calling broadcastMessage on the companion object
            val weakModule = WeakReference(this@WorkoutWorkerModule)
            val observer: (WorkoutMessage) -> Unit = { message ->
                weakModule.get()?.sendEvent(
                    "on",
                    bundleOf("jsonString" to Json.encodeToString( message))
                )
            }
            workoutMessageReceivedObservers.add(observer)
            workoutMessageReceivedObserver = observer
        }

        OnStopObserving("on") {
            workoutMessageReceivedObservers.remove(workoutMessageReceivedObserver)
        }

        OnDestroy {
            unbindIfNeeded()
        }

        Function("broadcast") { jsonString: String ->
            sendEvent(
                "on", bundleOf("jsonString" to jsonString)
            )

            val event =  Json.decodeFromString<WorkoutMessage>(jsonString)
            val context = appContext.reactContext ?: return@Function
            Log.d("WorkoutWorker", "Got workout event")

            when {
                event.payload is WorkoutStartedEvent -> {
                    if (event.appConfiguration.notificationsEnabled) {
                        // Start and bind to the service
                        val intent = Intent(context, WorkoutWorkerService::class.java)
                        ContextCompat.startForegroundService(context, intent)
                        context.bindService(intent, connection, Context.BIND_AUTO_CREATE)

                        // Store event to send once service is connected
                        pendingEvent = event
                    }
                }

                event.payload is WorkoutEndedEvent -> {
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
