import { Appbar } from 'react-native-paper';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { useScroll } from '@/hooks/useScollListener';
import { useEffect } from 'react';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAnimatedValue, Animated } from 'react-native';

export default function MaterialStackHeader(props: NativeStackHeaderProps) {
  const { isScrolled } = useScroll();
  const scrollColor = useAnimatedValue(0);
  const { colors } = useAppTheme();

  useEffect(() => {
    Animated.timing(scrollColor, {
      toValue: isScrolled ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isScrolled, scrollColor]);
  return (
    <Animated.View
      style={{
        backgroundColor: scrollColor.interpolate({
          inputRange: [0, 1],
          outputRange: [colors.surface, colors.surfaceContainer],
        }),
      }}
    >
      <Appbar.Header
        mode={props.back ? 'small' : 'center-aligned'}
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
