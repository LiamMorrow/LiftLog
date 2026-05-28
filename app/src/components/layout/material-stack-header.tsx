import { Appbar } from 'react-native-paper';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { useScroll } from '@/hooks/useScrollListener';
import { useEffect, useRef } from 'react';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Animated, Platform } from 'react-native';

export default function MaterialStackHeader(props: NativeStackHeaderProps) {
  const { isScrolled } = useScroll();
  const scrollColor = useRef(new Animated.Value(0)).current;
  const { colors } = useAppTheme();
  const customHeaderLeft = props.options.headerLeft?.({
    canGoBack: !!props.back,
    tintColor: colors.onSurface,
    label: props.back?.title,
    href: undefined,
  });
  const showDefaultBackAction =
    !!props.back &&
    props.options.headerBackVisible !== false &&
    customHeaderLeft === undefined;

  useEffect(() => {
    Animated.timing(scrollColor, {
      toValue: isScrolled ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isScrolled, scrollColor]);

  const backgroundColor = scrollColor.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.surface, colors.surfaceContainer],
  });

  return (
    <Animated.View style={{ backgroundColor }}>
      <Appbar.Header
        mode={
          showDefaultBackAction && Platform.OS !== 'ios'
            ? 'small'
            : 'center-aligned'
        }
        style={{
          backgroundColor: 'transparent',
        }}
      >
        {customHeaderLeft}
        {showDefaultBackAction ? (
          <Appbar.BackAction onPress={() => props.navigation.goBack()} />
        ) : null}
        <Appbar.Content title={props.options.title} />
        {props.options.headerRight?.({})}
      </Appbar.Header>
    </Animated.View>
  );
}
