import { spacing } from '@/hooks/useAppTheme';
import { Animated, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

export interface PageIndicatorProps {
  count: number;
  progress: Animated.AnimatedInterpolation<number> | Animated.Value;
  color: string;
  style?: StyleProp<ViewStyle>;
}

export function PageIndicator({ count, progress, color, style }: PageIndicatorProps) {
  if (count <= 1) {
    return null;
  }
  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: count }).map((_, index) => {
        const inputRange = [index - 1, index, index + 1];
        return (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: color,
                opacity: progress.interpolate({ inputRange, outputRange: [0.3, 0.9, 0.3], extrapolate: 'clamp' }),
                width: progress.interpolate({
                  inputRange,
                  outputRange: [spacing[2], spacing[6], spacing[2]],
                  extrapolate: 'clamp',
                }),
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing[2],
  },
  dot: {
    height: spacing[2],
    borderRadius: spacing[1],
  },
});
