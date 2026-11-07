package expo.modules.workoutworker

import android.app.Service
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.ServiceInfo
import android.os.Binder
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.ServiceCompat
import androidx.core.content.ContextCompat
import com.limajuice.liftlog.WorkoutAutoFinishDueEvent
import com.limajuice.liftlog.WorkoutEndedEvent
import com.limajuice.liftlog.WorkoutMessage
import com.limajuice.liftlog.WorkoutUpdatedEvent
import expo.modules.workoutworker.handlers.WorkoutEndedHandler
import expo.modules.workoutworker.handlers.WorkoutMessageHandler
import expo.modules.workoutworker.handlers.WorkoutStartedHandler
import expo.modules.workoutworker.handlers.WorkoutUpdatedHandler
import expo.modules.workoutworker.utils.WorkoutNotificationManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.launch
import kotlin.time.Clock
import kotlin.time.Duration.Companion.minutes

class WorkoutWorkerService : Service() {

    companion object {
        // delay() runs on a clock that stops while the device sleeps, so the wall clock is checked again each interval.
        private val AUTO_FINISH_CHECK_INTERVAL = 1.minutes
    }

    /** Binder that gives clients access to this service instance */
    inner class LocalBinder : Binder() {
        fun getService(): WorkoutWorkerService = this@WorkoutWorkerService
    }

    private val binder = LocalBinder()

    private lateinit var notificationManager: WorkoutNotificationManager

    private var eventDispatch: ((type: String, event: WorkoutMessage) -> Unit) =
        { _: String, _: WorkoutMessage -> }

    private val scope = CoroutineScope(
        SupervisorJob() + Dispatchers.Default
    )

    private var autoFinishJob: Job? = null

    private val events = MutableSharedFlow<WorkoutMessage>(
        extraBufferCapacity = 64
    )

    private val handlers: List<WorkoutMessageHandler> by lazy {
        listOf(
            WorkoutStartedHandler(notificationManager),
            WorkoutUpdatedHandler(notificationManager),
            WorkoutEndedHandler(notificationManager),
        )
    }

    private val dismissReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            notificationManager.onLiveUpdateDismissed()
        }
    }

    override fun onCreate() {
        super.onCreate()
        Log.d("WorkoutWorker", "Service created")

        notificationManager = WorkoutNotificationManager(this)

        ContextCompat.registerReceiver(
            this,
            dismissReceiver,
            IntentFilter(WorkoutConstants.ACTION_LIVE_UPDATE_DISMISSED),
            ContextCompat.RECEIVER_NOT_EXPORTED
        )

        scope.launch {
            events.collect { event ->
                dispatchToHandlers(event)
            }
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d("WorkoutWorker", "Service started")

        val notification = notificationManager.createWorkoutNotificationBuilder().build()

        val type = when {
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q -> ServiceInfo.FOREGROUND_SERVICE_TYPE_MANIFEST

            else -> 0 // This value is unused in prior versions
        }

        ServiceCompat.startForeground(
            this, WorkoutNotificationManager.PERSISTENT_NOTIFICATION_ID, notification, type
        )

        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder = binder

    fun setEventDispatch(dispatch: (type: String, event: WorkoutMessage) -> Unit) {
        eventDispatch = dispatch
    }

    fun enqueue(event: WorkoutMessage) {
        watchForAutoFinish(event)
        events.tryEmit(event)
    }

    private fun watchForAutoFinish(event: WorkoutMessage) {
        val payload = event.payload
        if (payload !is WorkoutUpdatedEvent && payload !is WorkoutEndedEvent) {
            return
        }
        autoFinishJob?.cancel()
        val autoFinishAt = (payload as? WorkoutUpdatedEvent)?.autoFinishAt ?: return
        autoFinishJob = scope.launch {
            while (Clock.System.now() < autoFinishAt) {
                delay(minOf(autoFinishAt - Clock.System.now(), AUTO_FINISH_CHECK_INTERVAL))
            }
            eventDispatch(
                "WorkoutAutoFinishDueEvent",
                event.copy(payload = WorkoutAutoFinishDueEvent(type = "WorkoutAutoFinishDueEvent"))
            )
        }
    }

    private suspend fun dispatchToHandlers(event: WorkoutMessage) {
        for (handler in handlers) {
            if (handler.canHandle(event)) {
                handler.handle(event, eventDispatch)
                return
            }
        }
        Log.d("WorkoutWorker", "No handler found for event: ${event.payload}")
    }

    override fun onDestroy() {
        Log.d("WorkoutWorker", "Service destroyed")
        scope.cancel()
        unregisterReceiver(dismissReceiver)
        handlers.forEach { it.onDestroy() }
        super.onDestroy()
    }
}
