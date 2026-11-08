import { buttonStyle } from '@expo/ui/swift-ui/modifiers';
import { isLiquidGlassAvailable } from 'expo-glass-effect';

/**
 * A glass button, or its bordered equivalent before iOS 26. SwiftUI would otherwise fall back to a
 * borderless button, which loses the prominent style's emphasis.
 */
export function glassButtonStyle(prominence: 'regular' | 'prominent') {
  if (isLiquidGlassAvailable()) {
    return buttonStyle(prominence === 'prominent' ? 'glassProminent' : 'glass');
  }
  return buttonStyle(prominence === 'prominent' ? 'borderedProminent' : 'bordered');
}
