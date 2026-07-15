import { GesturePressableProps } from '@/components/presentation/foundation/gesture-wrappers/pressable-props';
import { AppIconSource } from '@/components/presentation/foundation/ms-icon-source';
import { I18nManager } from 'react-native';
// oxlint-disable-next-line no-restricted-imports
import { IconButton as NativeIconButton, IconButtonProps } from 'react-native-paper';

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
  return (
    <NativeIconButton
      disabled={disabled}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[style, mirrored ? (I18nManager.isRTL ? { transform: [{ scaleX: -1 }] } : {}) : {}]}
      {...rest}
    />
  );
}
