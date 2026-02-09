import { Appbar } from 'react-native-paper';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { useScroll } from '@/hooks/useScrollListener';
import { useEffect } from 'react';
import { useAppTheme } from '@/hooks/useAppTheme';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { Platform } from 'react-native';

export default function MaterialStackHeader(props: NativeStackHeaderProps) {
  const { isScrolled } = useScroll();
  const scrollColor = useSharedValue(0);
  const { colors } = useAppTheme();

  useEffect(() => {
    scrollColor.value = withTiming(isScrolled ? 1 : 0, {
      duration: 200,
    });
  }, [isScrolled, scrollColor]);

  const backgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      scrollColor.value,
      [0, 1],
      [colors.surface, colors.surfaceContainer],
    ),
  }));

  return (
    <Animated.View style={backgroundStyle}>
      <Appbar.Header
        mode={props.back && Platform.OS !== 'ios' ? 'small' : 'center-aligned'}
        style={{
          backgroundColor: 'transparent',
        }}
      >
        {props.back ? (
          <Appbar.BackAction onPress={() => props.navigation.goBack()} />
        ) : null}
        <Appbar.Content title={props.options.title} />
        {props.options.headerRight?.({})}
      </Appbar.Header>
    </Animated.View>
  );
}
