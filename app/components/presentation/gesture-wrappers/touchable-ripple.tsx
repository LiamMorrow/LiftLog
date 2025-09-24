/* eslint-disable no-restricted-imports */
import { GesturePressableProps } from '@/components/presentation/gesture-wrappers/pressable-props';
import { isNotNullOrUndefined } from '@/utils/null';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  TouchableRippleProps,
  TouchableRipple as NativeTouchableRipple,
} from 'react-native-paper';

export default function TouchableRipple({
  onPress,
  onLongPress,
  ...rest
}: GesturePressableProps<TouchableRippleProps>) {
  const tap = Gesture.Tap()
    .runOnJS(true)
    .onEnd(() => onPress?.());
  const longPress = onLongPress
    ? Gesture.LongPress()
        .runOnJS(true)
        .onEnd(() => onLongPress())
    : undefined;
  const gesture = Gesture.Simultaneous(
    ...[tap, longPress].filter(isNotNullOrUndefined),
  );
  return (
    <GestureDetector gesture={gesture}>
      <NativeTouchableRipple
        onPress={onPress ? () => {} : undefined!}
        // Disable long press since we should be using Holdable for this
        onLongPress={onLongPress || onPress ? () => {} : undefined!}
        {...rest}
      />
    </GestureDetector>
  );
}
