import { NativeModule, requireNativeModule } from 'expo';

declare class ReactNativeHapticsModule extends NativeModule {
  triggerSlowRiseHaptic(): void;
  triggerClickHaptic(): void;
  cancelHaptic(): void;
}

const module = requireNativeModule<ReactNativeHapticsModule>('LiftLogHaptics');

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
