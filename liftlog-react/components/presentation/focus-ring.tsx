import { useAppTheme, spacing } from '@/hooks/useAppTheme';
import { ReactNode, useEffect } from 'react';
import { View, ViewProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

export const ANIMATION_DURATION = 350;
export default function FocusRing({
  isSelected,
  children,
  radius,
  style,
  ...rest
}: {
  isSelected: boolean;
  children: ReactNode;
  radius?: number;
} & ViewProps) {
  const { colors } = useAppTheme();
  const selectedAnim = useSharedValue(isSelected ? 1 : 0);

  useEffect(() => {
    selectedAnim.value = withTiming(isSelected ? 1 : 0, {
      duration: ANIMATION_DURATION,
    });
  }, [isSelected, selectedAnim]);

  const animatedStyle = useAnimatedStyle(() => {
    const pos = interpolate(selectedAnim.value, [0, 0.8, 1], [4, -7, -5]);
    return {
      borderColor: colors.outline,
      position: 'absolute',
      top: pos,
      bottom: pos,
      left: pos,
      right: pos,
      borderRadius: radius ?? spacing[14],
      borderWidth: 3,
    };
  });

  return (
    <View style={style}>
      <Animated.View style={[animatedStyle]} {...rest}></Animated.View>
      {children}
    </View>
  );
}
