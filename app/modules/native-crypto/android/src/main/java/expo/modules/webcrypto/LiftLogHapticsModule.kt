package expo.modules.webcrypto

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class LiftLogHapticsModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("LiftLogHaptics")

        AsyncFunction("triggerClickHaptic") {
            val context = appContext.reactContext
            val vibrator = context?.getSystemService(android.content.Context.VIBRATOR_SERVICE) as? android.os.Vibrator
            if (vibrator == null || !vibrator.hasVibrator()) {
            } else if (android.os.Build.VERSION.SDK_INT >= 29) {
                val effect = android.os.VibrationEffect.createPredefined(android.os.VibrationEffect.EFFECT_HEAVY_CLICK)
                vibrator.vibrate(effect)
            } else {
                vibrator.vibrate(50)
            }
            null
        }

        AsyncFunction("triggerSlowRiseHaptic") {
            val context = appContext.reactContext
            val vibrator = context?.getSystemService(android.content.Context.VIBRATOR_SERVICE) as? android.os.Vibrator
            if (vibrator == null || !vibrator.hasVibrator()) {
            }else if (android.os.Build.VERSION.SDK_INT >= 30) {
                val composition = android.os.VibrationEffect.startComposition()
                    .addPrimitive(android.os.VibrationEffect.Composition.PRIMITIVE_SLOW_RISE)
                    .compose()
                vibrator.vibrate(composition)
            } else {
                vibrator.vibrate(500)
            }
            null
        }

        AsyncFunction("cancelHaptic") {
            val context = appContext.reactContext
            val vibrator = context?.getSystemService(android.content.Context.VIBRATOR_SERVICE) as? android.os.Vibrator
            vibrator?.cancel()
            null
        }
    }
}
