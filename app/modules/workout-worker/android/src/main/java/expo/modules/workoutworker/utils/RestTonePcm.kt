package expo.modules.workoutworker.utils

import kotlin.math.PI
import kotlin.math.min
import kotlin.math.sin

/** One audio buffer keeps playback running through the silent gaps, even without music. */
internal object RestTonePcm {
    const val SAMPLE_RATE = 48_000
    const val FINAL_DURATION_MS = 1_000
    const val COUNTDOWN_DURATION_FRACTION = 0.5
    const val TAIL_MS = 200

    fun create(remainingSecs: Int): ShortArray {
        require(remainingSecs in 0..3)
        val totalMs = remainingSecs * 1_000 + FINAL_DURATION_MS + TAIL_MS
        val samples = ShortArray(totalMs * SAMPLE_RATE / 1_000)
        val fadeFrames = SAMPLE_RATE * 5 / 1_000
        for (second in 0..remainingSecs) {
            val durationMs = if (second == remainingSecs) FINAL_DURATION_MS
                else (FINAL_DURATION_MS * COUNTDOWN_DURATION_FRACTION).toInt()
            val highFrequencyHz = if (second == remainingSecs) 1477 else 1209
            val frames = durationMs * SAMPLE_RATE / 1_000
            val offset = second * SAMPLE_RATE
            for (frame in 0 until frames) {
                // DTMF 4 for countdown, DTMF 6 for final; short ramps avoid edge clicks.
                val time = frame.toDouble() / SAMPLE_RATE
                val envelope = min(1.0, min(frame, frames - 1 - frame).toDouble() / fadeFrames)
                val wave = sin(2 * PI * 770 * time) + sin(2 * PI * highFrequencyHz * time)
                samples[offset + frame] = (wave * envelope * 0.35 * Short.MAX_VALUE).toInt().toShort()
            }
        }
        return samples
    }
}
