import { NativeIconProps } from './native-icon-props';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Host, Icon } from '@expo/ui/jetpack-compose';
import { I18nManager } from 'react-native';

export function NativeIcon({ icon, size, color, mirrored, accessibilityLabel }: NativeIconProps) {
  const { colors } = useAppTheme();
  return (
    <Host
      seedColor={colors.seedColor}
      colorScheme={colors.scheme}
      style={{
        width: size,
        height: size,
        transform: mirrored && I18nManager.isRTL ? [{ scaleX: -1 }] : undefined,
      }}
    >
      <Icon source={icon} size={size} tint={color ?? colors.onSurface} contentDescription={accessibilityLabel} />
    </Host>
  );
}
