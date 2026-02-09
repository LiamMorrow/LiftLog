import { useAppTheme, spacing } from '@/hooks/useAppTheme';
import { ReactNode, useEffect } from 'react';
import { View, ViewProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Easing,
  ReduceMotion,
} from 'react-native-reanimated';

export const ANIMATION_DURATION = 600;
export default function FocusRing({
  isSelected,
  children,
  radius,
  style,
  padding,
  ...rest
}: {
  isSelected: boolean;
  children: ReactNode;
  radius?: number;
  padding?: number;
} & ViewProps) {
  const { colors } = useAppTheme();
  padding ??= 5;
  const growAnim = useSharedValue(isSelected ? 1 : 0);

  useEffect(() => {
    growAnim.value = withTiming(isSelected ? 1 : 0, {
      duration: ANIMATION_DURATION,
      easing: Easing.bezier(0.2, 0, 0, 1),
      reduceMotion: ReduceMotion.System,
    });
  }, [isSelected, growAnim]);

  const animatedStyle = useAnimatedStyle(() => {
    const pos = interpolate(growAnim.value, [0, 0.25, 1], [0, -8, -padding]);
    return {
      borderColor: colors.outline,
      position: 'absolute',
      top: pos,
      bottom: pos,
      left: pos,
      right: pos,
      borderRadius: radius ?? spacing[14],
      borderWidth: isSelected
        ? interpolate(growAnim.value, [0, 0.25, 1], [0, 8, 3])
        : 0,
    };
  });

  return (
    <View style={style}>
      <Animated.View style={[animatedStyle]} {...rest}></Animated.View>
      {children}
    </View>
  );
}
