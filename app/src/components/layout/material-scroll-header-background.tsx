import { useScroll } from '@/hooks/useScrollListener';
import { useEffect, useRef } from 'react';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Animated, Platform } from 'react-native';

export default function MaterialScrollHeaderBackground() {
  const { isScrolled } = useScroll();
  const scrollColor = useRef(new Animated.Value(0)).current;
  const { colors } = useAppTheme();

  useEffect(() => {
    Animated.timing(scrollColor, {
      toValue: isScrolled ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isScrolled, scrollColor]);
  if (Platform.OS === 'ios') {
    return undefined;
  }

  const backgroundColor = scrollColor.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.surface, colors.surfaceContainer],
  });

  return <Animated.View style={{ backgroundColor, flex: 1 }}></Animated.View>;
}
