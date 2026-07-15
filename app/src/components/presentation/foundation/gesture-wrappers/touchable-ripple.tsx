import { GesturePressableProps } from '@/components/presentation/foundation/gesture-wrappers/pressable-props';
// oxlint-disable-next-line no-restricted-imports
import { TouchableRippleProps, TouchableRipple as NativeTouchableRipple } from 'react-native-paper';

export default function TouchableRipple({
  onPress,
  onLongPress,
  disabled,
  ...rest
}: GesturePressableProps<TouchableRippleProps>) {
  return <NativeTouchableRipple disabled={disabled} onPress={onPress} onLongPress={onLongPress} {...rest} />;
}
