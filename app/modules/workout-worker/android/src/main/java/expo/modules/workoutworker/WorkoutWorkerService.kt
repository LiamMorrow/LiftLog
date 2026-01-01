package expo.modules.workoutworker

import LiftLog.Ui.Models.WorkoutMessage.WorkoutMessageOuterClass
import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Binder
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.ServiceCompat
import expo.modules.workoutworker.handlers.WorkoutEndedHandler
import expo.modules.workoutworker.handlers.WorkoutMessageHandler
import expo.modules.workoutworker.handlers.WorkoutStartedHandler
import expo.modules.workoutworker.handlers.WorkoutUpdatedHandler
import expo.modules.workoutworker.utils.WorkoutNotificationManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.launch

class WorkoutWorkerService : Service() {

    /** Binder that gives clients access to this service instance */
    inner class LocalBinder : Binder() {
        fun getService(): WorkoutWorkerService = this@WorkoutWorkerService
    }

    private val binder = LocalBinder()

    private lateinit var notificationManager: WorkoutNotificationManager

    private var eventDispatch: ((type: String, event: WorkoutMessageOuterClass.WorkoutMessage) -> Unit) =
        { _: String, _: WorkoutMessageOuterClass.WorkoutMessage -> }

    private val scope = CoroutineScope(
        SupervisorJob() + Dispatchers.Default
    )

    private val events = MutableSharedFlow<WorkoutMessageOuterClass.WorkoutMessage>(
        extraBufferCapacity = 64
    )

    private val handlers: List<WorkoutMessageHandler> by lazy {
        listOf(
            WorkoutStartedHandler(notificationManager),
            WorkoutUpdatedHandler(notificationManager),
            WorkoutEndedHandler(notificationManager),
        )
    }

    override fun onCreate() {
        super.onCreate()
        Log.d("WorkoutWorker", "Service created")

        notificationManager = WorkoutNotificationManager(this)

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

    fun setEventDispatch(dispatch: (type: String, event: WorkoutMessageOuterClass.WorkoutMessage) -> Unit) {
        eventDispatch = dispatch
    }

    fun enqueue(event: WorkoutMessageOuterClass.WorkoutMessage) {
        events.tryEmit(event)
    }

    private suspend fun dispatchToHandlers(event: WorkoutMessageOuterClass.WorkoutMessage) {
        for (handler in handlers) {
            if (handler.canHandle(event)) {
                handler.handle(event, eventDispatch)
                return
            }
        }
        Log.d("WorkoutWorker", "No handler found for event: ${event.payloadCase}")
    }

    override fun onDestroy() {
        Log.d("WorkoutWorker", "Service destroyed")
        scope.cancel()
        handlers.forEach { it.onDestroy() }
        super.onDestroy()
    }
}
