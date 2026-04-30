import { useAppTheme } from '@/hooks/useAppTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface XpProgressBarProps {
  current: number;
  needed: number;
  height?: number;
}

export default function XpProgressBar({
  current,
  needed,
  height = 10,
}: XpProgressBarProps) {
  const { colors } = useAppTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    const ratio = needed > 0 ? Math.min(current / needed, 1) : 0;
    progress.value = withTiming(ratio, { duration: 800 });
  }, [current, needed, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View
      style={[
        styles.track,
        {
          height,
          backgroundColor: colors.surfaceVariant,
          borderRadius: height / 2,
        },
      ]}
    >
      <Animated.View style={[styles.fill, { borderRadius: height / 2 }, animatedStyle]}>
        <LinearGradient
          colors={[colors.amber, colors.yellow]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    overflow: 'hidden',
  },
});
