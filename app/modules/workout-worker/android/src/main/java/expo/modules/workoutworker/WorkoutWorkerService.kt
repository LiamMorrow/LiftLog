package expo.modules.workoutworker

import LiftLog.Ui.Models.SessionHistoryDao.SessionHistoryDaoV2OuterClass
import LiftLog.Ui.Models.WorkoutEvent.WorkoutEventOuterClass
import android.app.Notification
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import expo.modules.workoutworker.handlers.TimerStartedHandler
import expo.modules.workoutworker.handlers.WorkoutEventHandler
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.launch

class WorkoutWorkerService : Service() {

    companion object {
        @Volatile
        var instance: WorkoutWorkerService? = null
            private set

        private const val NOTIFICATION_ID = 123
        private const val CHANNEL_ID = "workout_channel"
    }

    private val scope = CoroutineScope(
        SupervisorJob() + Dispatchers.Default
    )


    private var workout: SessionHistoryDaoV2OuterClass.SessionDaoV2? = null;

    private val events = MutableSharedFlow<WorkoutEventOuterClass.WorkoutEvent>(
        extraBufferCapacity = 64
    )

    private val handlers: List<WorkoutEventHandler> = listOf(
        TimerStartedHandler(),
    )

    override fun onCreate() {
        super.onCreate()
        instance = this
        Log.d("WorkoutWorker", "Service created")

        scope.launch {
            events.collect { event ->
                if (event.hasWorkoutStarted()) {
                    workout = event.workoutStarted.workout
                }
                if (event.hasWorkoutUpdated()) {
                    workout = event.workoutUpdated.workout
                }
                if (event.hasWorkoutEnded()) {
                    workout = null;
                }
                dispatchToHandlers(event)
            }
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d("WorkoutWorker", "Service started")

        val notification = buildNotification().setContentText("Workout in progress").build()

        ServiceCompat.startForeground(
            this, NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
        )

        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    fun enqueue(event: WorkoutEventOuterClass.WorkoutEvent) {
        events.tryEmit(event)
    }

    fun updateNotification(notification: Notification) {
        val manager = getSystemService(NotificationManager::class.java)
        manager.notify(NOTIFICATION_ID, notification)
    }


    fun buildNotification(): NotificationCompat.Builder {
        return NotificationCompat.Builder(this, CHANNEL_ID).setContentTitle("LiftLog")
            .setSmallIcon(android.R.drawable.ic_media_ff).setOngoing(true).setSilent(true)
    }

    private suspend fun dispatchToHandlers(event: WorkoutEventOuterClass.WorkoutEvent) {
        for (handler in handlers) {
            if (handler.canHandle(event)) {
                handler.handle(event, workout)
                return
            }
        }
        Log.d("WorkoutWorker", "No handler found for event: ${event.eventPayloadCase}")
    }

    override fun onDestroy() {
        Log.d("WorkoutWorker", "Service destroyed")
        instance = null
        scope.cancel()
        super.onDestroy()
    }
}
