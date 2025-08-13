import { NativeModule, requireNativeModule } from 'expo';
import { Platform, Vibration } from 'react-native';

declare class ReactNativeHapticsModule extends NativeModule {
  triggerSlowRiseHaptic(): void;
  triggerClickHaptic(): void;
  cancelHaptic(): void;
}

const module =
  Platform.OS === 'web'
    ? {
        triggerClickHaptic() {
          try {
            Vibration.vibrate(50);
          } catch {}
        },
        triggerSlowRiseHaptic() {},
        cancelHaptic() {},
      }
    : requireNativeModule<ReactNativeHapticsModule>('LiftLogHaptics');

export const triggerSlowRiseHaptic = () => {
  module.triggerSlowRiseHaptic();
};

export const triggerClickHaptic = () => {
  module.triggerClickHaptic();
};

export const cancelHaptic = () => {
  module.cancelHaptic();
};

export default module;
