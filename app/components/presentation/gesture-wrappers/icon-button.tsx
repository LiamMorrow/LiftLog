/* eslint-disable no-restricted-imports */
import { GesturePressableProps } from '@/components/presentation/gesture-wrappers/pressable-props';
import { AppIconSource } from '@/components/presentation/ms-icon-source';
import { isNotNullOrUndefined } from '@/utils/null';
import { I18nManager } from 'react-native';
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
  disabled,
  mirrored,
  style,
  ...rest
}: GesturePressableProps<ICProps> & { mirrored?: boolean }) {
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
      <NativeIconButton
        disabled={disabled!}
        onPress={onPress ? () => {} : undefined!}
        onLongPress={onLongPress || onPress ? () => {} : undefined!}
        style={[
          style,
          mirrored
            ? I18nManager.isRTL
              ? { transform: [{ scaleX: -1 }] }
              : {}
            : {},
        ]}
        {...rest}
      />
    </GestureDetector>
  );
}
