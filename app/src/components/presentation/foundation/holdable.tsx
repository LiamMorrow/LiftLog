import {
  cancelHaptic,
  triggerClickHaptic,
  triggerSlowRiseHaptic,
} from '~/modules/native-lib/src/ReactNativeHapticsModule';
import { ReactNode, useRef } from 'react';
import { Animated, Easing, ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

export type HoldableProps = {
  children: ReactNode;
  onLongPress: () => void;
  duration?: number;
  disabled?: boolean;
  style?: ViewStyle;
};

export default function Holdable({ children, onLongPress, duration = 500, style, disabled }: HoldableProps) {
  const holdingScale = useRef(new Animated.Value(1)).current;

  const handleLongPress = () => {
    onLongPress();
    triggerClickHaptic();
  };

  const enterHold = () => {
    Animated.timing(holdingScale, {
      toValue: 1.1,
      duration,
      easing: Easing.bezier(0.21, 0.95, 0.67, 0.28),
      useNativeDriver: true,
    }).start();
    triggerSlowRiseHaptic();
  };

  const exitHold = (triggered: boolean) => {
    Animated.timing(holdingScale, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start();
    if (!triggered) cancelHaptic();
  };

  const gesture = disabled
    ? Gesture.Manual()
    : Gesture.LongPress()
        .minDuration(duration)
        .runOnJS(true)
        .onBegin(enterHold)
        .onFinalize((_, triggered) => exitHold(triggered))
        .onStart(handleLongPress);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[style, { transform: [{ scale: holdingScale }] }]}>{children}</Animated.View>
    </GestureDetector>
  );
}
