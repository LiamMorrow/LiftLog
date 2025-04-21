import { useAppTheme, spacing } from '@/hooks/useAppTheme';
import { ReactNode, useEffect } from 'react';
import { Animated, useAnimatedValue, ViewProps } from 'react-native';

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
} & ViewProps) {
  const { colors } = useAppTheme();
  const selectedAnim = useAnimatedValue(isSelected ? 1 : 0);
  const inputRange = [0, 1];
  useEffect(() => {
    Animated.timing(selectedAnim, {
      toValue: isSelected ? 1 : 0,
      duration: ANIMATION_DURATION,
      useNativeDriver: false,
    }).start();
  }, [isSelected, selectedAnim]);
  return (
    <Animated.View
      style={[
        {
          borderColor: selectedAnim.interpolate({
            inputRange,
            outputRange: ['transparent', colors.outline],
          }),
          padding: 2,
          margin: -5,
          borderRadius: radius ?? spacing[14],
          borderWidth: 3,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Animated.View>
  );
}
