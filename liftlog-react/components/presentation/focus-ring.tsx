import { useAppTheme, spacing } from '@/hooks/useAppTheme';
import { ReactNode, useEffect } from 'react';
import { ViewProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  AnimatedProps,
} from 'react-native-reanimated';

export const ANIMATION_DURATION = 200;
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
} & AnimatedProps<ViewProps>) {
  const { colors } = useAppTheme();
  const selectedAnim = useSharedValue(isSelected ? 1 : 0);

  useEffect(() => {
    selectedAnim.value = withTiming(isSelected ? 1 : 0, {
      duration: ANIMATION_DURATION,
    });
  }, [isSelected, selectedAnim]);

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: selectedAnim.value === 1 ? colors.outline : 'transparent',
    padding: 2,
    margin: -5,
    borderRadius: radius ?? spacing[14],
    borderWidth: 3,
  }));

  return (
    <Animated.View style={[animatedStyle, style]} {...rest}>
      {children}
    </Animated.View>
  );
}
