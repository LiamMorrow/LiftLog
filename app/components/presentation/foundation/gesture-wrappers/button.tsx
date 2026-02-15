/* eslint-disable no-restricted-imports */
import { GesturePressableProps } from '@/components/presentation/foundation/gesture-wrappers/pressable-props';
import { AppIconSource } from '@/components/presentation/foundation/ms-icon-source';
import { isNotNullOrUndefined } from '@/utils/null';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  Button as NativeButton,
  ButtonProps as PaperButtonProps,
} from 'react-native-paper';

export type ButtonProps = {
  icon?: AppIconSource;
} & Omit<PaperButtonProps, 'icon'>;
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
