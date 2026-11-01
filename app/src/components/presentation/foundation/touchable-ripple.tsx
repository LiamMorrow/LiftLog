import { GesturePressableProps } from '@/components/presentation/foundation/pressable-props';
import { useAppTheme } from '@/hooks/useAppTheme';
import { withAlpha } from '@/utils/color';
import { isNotNullOrUndefined } from '@/utils/null';
import { ReactNode } from 'react';
import { Platform, Pressable, PressableProps, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

type TouchableRippleProps = Omit<PressableProps, 'children'> & { children: ReactNode };

export default function TouchableRipple({
  onPress,
  onLongPress,
  disabled,
  children,
  ...rest
}: GesturePressableProps<TouchableRippleProps>) {
  const { colors } = useAppTheme();
  const rippleColor = withAlpha(colors.onSurface, 0.12);
  const tap = Gesture.Tap()
    .runOnJS(true)
    .onStart(() => !disabled && onPress?.());
  const longPress = onLongPress
    ? Gesture.LongPress()
        .runOnJS(true)
        .onStart(() => !disabled && onLongPress())
    : undefined;
  const gesture = Gesture.Race(...[tap, longPress].filter(isNotNullOrUndefined));
  const interactive = !disabled && (onPress || onLongPress);
  return (
    <GestureDetector gesture={gesture}>
      <Pressable
        {...rest}
        disabled={!interactive}
        onPress={() => {}}
        android_ripple={Platform.OS === 'android' ? { color: rippleColor } : undefined}
      >
        {({ pressed }) => (
          <>
            {Platform.OS !== 'android' && pressed && (
              <View style={[StyleSheet.absoluteFill, styles.underlay, { backgroundColor: rippleColor }]} />
            )}
            {children}
          </>
        )}
      </Pressable>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  underlay: {
    zIndex: 2,
  },
});
