package expo.modules.workoutworker.utils

import android.app.Notification
import android.app.NotificationManager
import android.content.Context
import android.media.AudioAttributes
import android.media.AudioDeviceInfo
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.media.AudioFormat
import android.media.AudioRouting
import android.media.AudioTrack
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.util.Log
import androidx.annotation.DrawableRes
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE
import androidx.core.app.NotificationManagerCompat
import expo.modules.workoutworker.R
import expo.modules.workoutworker.WorkoutConstants.getLaunchAppAtWorkoutPagePendingIntent
import expo.modules.workoutworker.WorkoutConstants.getLiveUpdateDeleteIntent


// Which stage of a rest break the timer is in, and the small icon that marks it in the notification
// (both the promoted Live Update chip and the plain notification on pre-Android-16 devices).
enum class RestWindow(@DrawableRes val icon: Int) {
    RESTING(R.drawable.hourglass_empty_24px),   // before the minimum rest is up
    READY(R.drawable.play_arrow_24px),          // between minimum and maximum rest
    DONE(R.drawable.check_24px);                 // past the maximum rest

    companion object {
        fun of(nowSecs: Long, minRestEndSecs: Long, maxRestEndSecs: Long): RestWindow = when {
            nowSecs < minRestEndSecs -> RESTING
            nowSecs < maxRestEndSecs -> READY
            else -> DONE
        }
    }
}


class WorkoutNotificationManager(private val context: Context) {

    private val audioManager = context.getSystemService(AudioManager::class.java)
    private val restToneHandler = Handler(Looper.getMainLooper())
    private val restTonePlaybacks = mutableMapOf<Long, AudioTrack>()
    private var toneSequence = 0L
    private var restToneAudioFocusRequest: AudioFocusRequest? = null
    private val audioFocusChangeListener = AudioManager.OnAudioFocusChangeListener { focusChange ->
        if (focusChange == AudioManager.AUDIOFOCUS_LOSS || focusChange == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT) {
            releaseAllRestTones()
        }
    }

    companion object {
        const val PERSISTENT_NOTIFICATION_ID = 123
        const val REST_NOTIFICATION_ID = 1234

        const val PERSISTENT_CHANNEL_ID = "workout_channel"
        const val REST_CHANNEL_ID = "rest_channel"

        private val HEADPHONE_AUDIO_DEVICE_TYPES = setOf(
            AudioDeviceInfo.TYPE_BLE_HEADSET,
            AudioDeviceInfo.TYPE_BLUETOOTH_A2DP,
            AudioDeviceInfo.TYPE_USB_HEADSET,
            AudioDeviceInfo.TYPE_WIRED_HEADPHONES,
            AudioDeviceInfo.TYPE_WIRED_HEADSET,
        )

        private val REST_TONE_AUDIO_ATTRIBUTES = AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_MEDIA)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build()
    }

    // Set once the user swipes the Live Update away; from then on we stop requesting promotion so
    // Android doesn't revoke our permission for re-posting a dismissed promoted notification.
    @Volatile
    private var promotionDismissed = false

    fun onLiveUpdateDismissed() {
        promotionDismissed = true
    }

    fun resetPromotion() {
        promotionDismissed = false
    }

    private fun canPromote(): Boolean =
        !promotionDismissed && NotificationManagerCompat.from(context).canPostPromotedNotifications()

    fun createWorkoutNotificationBuilder(promote: Boolean = true): NotificationCompat.Builder {
        return NotificationCompat.Builder(context, PERSISTENT_CHANNEL_ID)
            .setContentTitle("LiftLog")
            // Without this the notification defaults to VISIBILITY_PRIVATE and gets redacted to a
            // blank outline on a secure lock screen when "show sensitive content" is off.
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setForegroundServiceBehavior(FOREGROUND_SERVICE_IMMEDIATE)
            .setContentIntent(context.getLaunchAppAtWorkoutPagePendingIntent())
            .setDeleteIntent(context.getLiveUpdateDeleteIntent())
            .setSmallIcon(R.drawable.fitness_center_24px)
            .setOngoing(true)
            .setSilent(true)
            .setOnlyAlertOnce(true)
            .setRequestPromotedOngoing(promote && canPromote())
    }

    // A promoted progress bar for the active timer. `partialThreshold` splits the bar into a min-rest
    // and max-rest segment with a point at the boundary; an indeterminate bar is used when the end is
    // unknowable (e.g. a distance cardio target) or already passed.
    fun timerProgressStyle(
        progress: Int,
        max: Int,
        partialThreshold: Int? = null,
        indeterminate: Boolean = false,
    ): NotificationCompat.ProgressStyle {
        if (indeterminate || max <= 0) {
            return NotificationCompat.ProgressStyle().setProgressIndeterminate(true)
        }
        val style = NotificationCompat.ProgressStyle().setProgress(progress.coerceIn(0, max))
        if (partialThreshold != null && partialThreshold in 1 until max) {
            style.setProgressSegments(
                listOf(
                    NotificationCompat.ProgressStyle.Segment(partialThreshold),
                    NotificationCompat.ProgressStyle.Segment(max - partialThreshold),
                )
            ).addProgressPoint(NotificationCompat.ProgressStyle.Point(partialThreshold))
        } else {
            style.setProgressSegments(listOf(NotificationCompat.ProgressStyle.Segment(max)))
        }
        return style
    }

    fun createRestNotificationBuilder(): NotificationCompat.Builder {
        return NotificationCompat.Builder(context, REST_CHANNEL_ID)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setForegroundServiceBehavior(FOREGROUND_SERVICE_IMMEDIATE)
            .setContentIntent(context.getLaunchAppAtWorkoutPagePendingIntent())
            .setSmallIcon(R.drawable.fitness_center_24px)
            .setOngoing(false)
            .setSilent(false)
            .setOnlyAlertOnce(true)
    }


    fun notifyPersistent(notification: android.app.Notification) {
        val manager = context.getSystemService(NotificationManager::class.java)
        manager.notify(PERSISTENT_NOTIFICATION_ID, notification)
    }

    fun notifyRest(notification: Notification, targetEpochMs: Long? = null) {
        val manager = context.getSystemService(NotificationManager::class.java)
        manager.notify(REST_NOTIFICATION_ID, notification)
        playRestToneSequence(targetEpochMs, 0)
    }

    fun playRestCountdownTone(remainingSecs: Long, targetEpochMs: Long) {
        playRestToneSequence(targetEpochMs, remainingSecs.toInt())
    }

    private fun playRestToneSequence(targetEpochMs: Long?, remainingSecs: Int) {
        val outputs = audioManager.getDevices(AudioManager.GET_DEVICES_OUTPUTS)
        if (audioManager.ringerMode == AudioManager.RINGER_MODE_NORMAL ||
            outputs.none { it.type in HEADPHONE_AUDIO_DEVICE_TYPES }) {
            releaseAllRestTones()
            return
        }
        // Later countdown ticks and the final notification must not replay buffered tones.
        if (targetEpochMs != null && restTonePlaybacks.containsKey(targetEpochMs)) {
            return
        }
        val key = targetEpochMs ?: -(++toneSequence)
        var track: AudioTrack? = null
        try {
            if (restTonePlaybacks.isEmpty() && !requestRestToneAudioFocus(audioManager)) {
                return
            }
            val samples = RestTonePcm.create(remainingSecs)
            val audioTrack = AudioTrack.Builder()
                .setAudioAttributes(REST_TONE_AUDIO_ATTRIBUTES)
                .setAudioFormat(AudioFormat.Builder()
                    .setSampleRate(RestTonePcm.SAMPLE_RATE)
                    .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                    .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                    .build())
                .setTransferMode(AudioTrack.MODE_STATIC)
                .setBufferSizeInBytes(samples.size * 2)
                .build()
            track = audioTrack
            // MODE_STATIC remains STATE_NO_STATIC_DATA until its first successful write.
            val initialState = audioTrack.state
            check(initialState != AudioTrack.STATE_UNINITIALIZED) { "AudioTrack initialization failed: state=$initialState" }
            val written = audioTrack.write(samples, 0, samples.size)
            check(written == samples.size) { "Incomplete PCM write: $written/${samples.size}" }
            check(audioTrack.state == AudioTrack.STATE_INITIALIZED) { "AudioTrack not ready after write: state=${audioTrack.state}" }
            val playback = audioTrack
            restTonePlaybacks[key] = playback
            audioTrack.setPlaybackPositionUpdateListener(object : AudioTrack.OnPlaybackPositionUpdateListener {
                override fun onMarkerReached(track: AudioTrack) {
                    if (restTonePlaybacks[key] === playback) releaseRestTone(key)
                }
                override fun onPeriodicNotification(track: AudioTrack) {
                    if (restTonePlaybacks[key] !== playback) return
                    if (audioManager.ringerMode == AudioManager.RINGER_MODE_NORMAL) {
                        releaseAllRestTones()
                    }
                }
            }, restToneHandler)
            audioTrack.addOnRoutingChangedListener(AudioRouting.OnRoutingChangedListener { routing ->
                if (restTonePlaybacks[key] === playback) {
                    val deviceType = routing.routedDevice?.type
                    if (deviceType != null && deviceType !in HEADPHONE_AUDIO_DEVICE_TYPES) {
                        releaseRestTone(key)
                    }
                }
            }, restToneHandler)
            check(audioTrack.setNotificationMarkerPosition(samples.size - 1) == AudioTrack.SUCCESS)
            check(audioTrack.setPositionNotificationPeriod(RestTonePcm.SAMPLE_RATE) == AudioTrack.SUCCESS)
            audioTrack.play()
            val returnedAt = SystemClock.uptimeMillis()
            val bufferMs = samples.size * 1_000L / RestTonePcm.SAMPLE_RATE
            // Marker completion follows playback progress, not wall time. This only bounds leaks
            // if a device fails to deliver its completion callback.
            restToneHandler.postAtTime({
                if (restTonePlaybacks[key] === playback) releaseRestTone(key)
            }, playback, returnedAt + bufferMs + 2_000)
        } catch (e: Exception) {
            if (restTonePlaybacks.containsKey(key)) releaseRestTone(key)
            else {
                track?.release()
                if (restTonePlaybacks.isEmpty()) abandonRestToneAudioFocus(audioManager)
            }
            Log.e("WorkoutNotificationManager", "Failed to play rest tone sequence", e)
        }
    }

    private fun requestRestToneAudioFocus(audioManager: AudioManager): Boolean {
        val result = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val request = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK)
                .setAudioAttributes(REST_TONE_AUDIO_ATTRIBUTES)
                .setOnAudioFocusChangeListener(audioFocusChangeListener)
                .build()
            restToneAudioFocusRequest = request
            audioManager.requestAudioFocus(request)
        } else {
            @Suppress("DEPRECATION")
            audioManager.requestAudioFocus(
                audioFocusChangeListener,
                AudioManager.STREAM_MUSIC,
                AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK,
            )
        }
        val granted = result == AudioManager.AUDIOFOCUS_REQUEST_GRANTED
        if (!granted) restToneAudioFocusRequest = null
        return granted
    }

    fun cancelRestToneSequence() {
        releaseAllRestTones()
    }

    private fun releaseAllRestTones() {
        restTonePlaybacks.keys.toList().forEach { releaseRestTone(it) }
    }

    private fun releaseRestTone(key: Long) {
        val playback = restTonePlaybacks.remove(key) ?: return
        restToneHandler.removeCallbacksAndMessages(playback)
        try {
            playback.stop()
        } finally {
            playback.release()
            if (restTonePlaybacks.isEmpty()) abandonRestToneAudioFocus(audioManager)
        }
    }

    private fun abandonRestToneAudioFocus(audioManager: AudioManager) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            restToneAudioFocusRequest?.let(audioManager::abandonAudioFocusRequest)
            restToneAudioFocusRequest = null
        } else {
            @Suppress("DEPRECATION")
            audioManager.abandonAudioFocus(audioFocusChangeListener)
        }
    }


    fun clearPersistentNotification() {
        val manager = context.getSystemService(NotificationManager::class.java)
        manager.cancel(PERSISTENT_NOTIFICATION_ID)
    }

    fun clearRestNotification() {
        val manager = context.getSystemService(NotificationManager::class.java)
        manager.cancel(REST_NOTIFICATION_ID)
    }
}
