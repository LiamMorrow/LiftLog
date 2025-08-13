import ExpoModulesCore
import UIKit

public class LiftLogHapticsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("LiftLogHaptics")

    AsyncFunction("triggerClickHaptic") { () -> Void in
      let generator = UIImpactFeedbackGenerator(style: .heavy)
      generator.prepare()
      generator.impactOccurred()
    }

    AsyncFunction("triggerSlowRiseHaptic") { () -> Void in
    }

    AsyncFunction("cancelHaptic") { () -> Void in
      // iOS haptic feedback cannot be cancelled once triggered
    }
  }
}
