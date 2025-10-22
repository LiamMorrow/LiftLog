import {
  cancelHaptic,
  triggerClickHaptic,
  triggerSlowRiseHaptic,
} from '@/modules/native-crypto/src/ReactNativeHapticsModule';
import { ReactNode } from 'react';
import { ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  AnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export type HoldableProps = {
  children: ReactNode;
  onLongPress: () => void;
  duration?: number;
  style?: ViewStyle;
} & Pick<AnimatedProps<Animated.View>, 'layout' | 'entering' | 'exiting'>;
export default function Holdable({
  children,
  onLongPress,
  duration = 500,
  style,
  layout,
  entering,
  exiting,
}: HoldableProps) {
  const holdingScale = useSharedValue(1);
  const layoutAnims = {
    layout: layout!,
    entering: entering!,
    exiting: exiting!,
  };

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
      <Animated.View {...layoutAnims} style={[style]}>
        <Animated.View style={[scaleStyle, { flex: 1 }]}>
          {children}
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}
