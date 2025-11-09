/* eslint-disable no-restricted-imports */
import { GesturePressableProps } from '@/components/presentation/gesture-wrappers/pressable-props';
import { isNotNullOrUndefined } from '@/utils/null';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Button as NativeButton, ButtonProps } from 'react-native-paper';

export default function Button({
  onPress,
  onLongPress,
  disabled,
  ...rest
}: GesturePressableProps<ButtonProps>) {
  const tap = Gesture.Tap()
    .runOnJS(true)
    .onStart(() => !disabled && onPress?.());
  const longPress = onLongPress
    ? Gesture.LongPress()
        .runOnJS(true)
        .onStart(() => !disabled && onLongPress())
    : undefined;
  const gesture = Gesture.Race(
    ...[tap, longPress].filter(isNotNullOrUndefined),
  );
  return (
    <GestureDetector gesture={gesture}>
      <NativeButton
        disabled={disabled!}
        onPress={onPress ? () => {} : undefined!}
        onLongPress={onLongPress || onPress ? () => {} : undefined!}
        {...rest}
      />
    </GestureDetector>
  );
}
