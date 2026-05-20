import { useAppTheme, spacing } from '@/hooks/useAppTheme';
import { ReactNode, useEffect, useRef } from 'react';
import { View, ViewProps, Animated, Easing } from 'react-native';

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

  const growAnim = useRef(new Animated.Value(isSelected ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(growAnim, {
      toValue: isSelected ? 1 : 0,
      duration: ANIMATION_DURATION,
      easing: Easing.bezier(0.2, 0, 0, 1),
      useNativeDriver: false,
    }).start();
  }, [isSelected, growAnim]);

  const pos = growAnim.interpolate({
    inputRange: [0, 0.25, 1],
    outputRange: [0, -8, -padding],
  });

  const borderWidth = growAnim.interpolate({
    inputRange: [0, 0.25, 1],
    outputRange: [0, 8, 3],
  });
  const opacity = growAnim;

  return (
    <View style={style}>
      <Animated.View
        style={{
          borderColor: colors.outline,
          position: 'absolute',
          top: pos,
          bottom: pos,
          left: pos,
          right: pos,
          opacity: opacity,
          borderRadius: radius ?? spacing[14],
          borderWidth: isSelected ? borderWidth : 0,
        }}
        {...rest}
      />
      {children}
    </View>
  );
}
