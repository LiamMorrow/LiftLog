import {
  cancelHaptic,
  triggerClickHaptic,
  triggerSlowRiseHaptic,
} from '@/modules/native-crypto/src/ReactNativeHapticsModule';
import { ReactNode, useEffect, useState } from 'react';
import { ViewProps } from 'react-native';
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
  const [isHolding, setIsHolding] = useState(false);
  const [holdTimeout, setHoldTimeout] = useState<number>();

  const handleLongPress = () => {
    triggerClickHaptic();
    onLongPress();
    setIsHolding(false);
  };
  const enterHold = () => {
    setIsHolding(true);

    triggerSlowRiseHaptic();
    clearTimeout(holdTimeout);
    setHoldTimeout(
      setTimeout(() => {
        handleLongPress();
      }, duration),
    );
  };
  const exitHold = () => {
    clearTimeout(holdTimeout);
    setIsHolding(false);
    cancelHaptic();
  };
  const callbacks: Partial<ViewProps> = {
    onTouchStart: enterHold,
    onPointerDown: enterHold,
    onPointerUp: exitHold,
    onPointerLeave: exitHold,
    onTouchEnd: exitHold,
  };

  useEffect(() => {
    holdingScale.value = withTiming(isHolding ? 1.1 : 1, {
      duration,
    });
  }, [holdingScale, isHolding, duration]);
  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: holdingScale.value }],
  }));
  return (
    <Animated.View style={[scaleStyle]} {...callbacks}>
      {children}
    </Animated.View>
  );
}
