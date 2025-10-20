/* eslint-disable no-restricted-imports */
import { GesturePressableProps } from '@/components/presentation/gesture-wrappers/pressable-props';
import { AppIconSource } from '@/components/presentation/ms-icon-source';
import { isNotNullOrUndefined } from '@/utils/null';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  IconButton as NativeIconButton,
  IconButtonProps,
} from 'react-native-paper';

type ICProps = {
  icon: AppIconSource;
} & Omit<IconButtonProps, 'icon'>;

export default function IconButton({
  onPress,
  onLongPress,
  ...rest
}: GesturePressableProps<ICProps>) {
  const tap = Gesture.Tap()
    .runOnJS(true)
    .onStart(() => onPress?.());
  const longPress = onLongPress
    ? Gesture.LongPress()
        .runOnJS(true)
        .onStart(() => onLongPress())
    : undefined;
  const gesture = Gesture.Race(
    ...[tap, longPress].filter(isNotNullOrUndefined),
  );
  return (
    <GestureDetector gesture={gesture}>
      <NativeIconButton
        onPress={onPress ? () => {} : undefined!}
        onLongPress={onLongPress || onPress ? () => {} : undefined!}
        {...rest}
      />
    </GestureDetector>
  );
}
