import {
  cancelHaptic,
  triggerClickHaptic,
  triggerSlowRiseHaptic,
} from '@/modules/native-crypto/src/ReactNativeHapticsModule';
import { ReactNode } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export interface HoldableProps {
  children: ReactNode;
  onLongPress: () => void;
  duration?: number;
}
export default function Holdable({
  children,
  onLongPress,
  duration = 500,
}: HoldableProps) {
  const holdingScale = useSharedValue(1);

  const handleLongPress = () => {
    onLongPress();
    triggerClickHaptic();
  };
  const enterHold = () => {
    holdingScale.value = withTiming(1.1, {
      duration,
    });
    triggerSlowRiseHaptic();
  };
  const exitHold = (triggered: boolean) => {
    holdingScale.value = withTiming(1, {
      duration,
    });
    if (!triggered) cancelHaptic();
  };
  const gesture = Gesture.LongPress()
    .minDuration(duration)
    .runOnJS(true)
    .onBegin(enterHold)
    .onFinalize((_, triggered) => exitHold(triggered))
    .onStart(handleLongPress);

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: holdingScale.value }],
  }));
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[scaleStyle]}>{children}</Animated.View>
    </GestureDetector>
  );
}
