import React from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';

interface LoadingDotsProps {
  size?: number;
  color?: string;
  duration?: number;
  gap?: number;
}

export function LoadingDots({
  size = 8,
  color,
  duration = 600,
  gap = spacing[1],
}: LoadingDotsProps) {
  const { colors } = useAppTheme();
  const dotColor = color || colors.onSurface;

  // Shared values for each dot's vertical position
  const dot1Y = useSharedValue(0);
  const dot2Y = useSharedValue(0);
  const dot3Y = useSharedValue(0);

  // Start the animations immediately
  React.useEffect(() => {
    const animationDistance = -size * 0.8; // Move up by 80% of dot size

    // Animate dot 1
    dot1Y.value = withRepeat(
      withTiming(animationDistance, { duration: duration / 2 }),
      -1,
      true,
    );

    // Animate dot 2 with delay
    dot2Y.value = withDelay(
      duration / 6,
      withRepeat(
        withTiming(animationDistance, { duration: duration / 2 }),
        -1,
        true,
      ),
    );

    // Animate dot 3 with longer delay
    dot3Y.value = withDelay(
      duration / 3,
      withRepeat(
        withTiming(animationDistance, { duration: duration / 2 }),
        -1,
        true,
      ),
    );
  }, [dot1Y, dot2Y, dot3Y, duration, size]);

  // Animated styles for each dot
  const dot1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot1Y.value }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot2Y.value }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: dot3Y.value }],
  }));

  const dotBaseStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: dotColor,
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: gap,
      }}
    >
      <Animated.View style={[dotBaseStyle, dot1Style]} />
      <Animated.View style={[dotBaseStyle, dot2Style]} />
      <Animated.View style={[dotBaseStyle, dot3Style]} />
    </View>
  );
}
