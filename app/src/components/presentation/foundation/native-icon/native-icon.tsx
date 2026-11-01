import { InlineHost } from '@/components/presentation/foundation/inline-host';
import { NativeIconProps, sfSymbolSize } from './native-icon-props';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Image } from '@expo/ui/swift-ui';
import { accessibilityLabel as accessibilityLabelModifier, frame } from '@expo/ui/swift-ui/modifiers';
import { I18nManager } from 'react-native';

export function NativeIcon({ systemImage, size, color, mirrored, accessibilityLabel }: NativeIconProps) {
  const { colors } = useAppTheme();
  return (
    <InlineHost
      style={{
        width: size,
        height: size,
        transform: mirrored && I18nManager.isRTL ? [{ scaleX: -1 }] : undefined,
      }}
    >
      <Image
        systemName={systemImage}
        size={sfSymbolSize(size)}
        color={color ?? colors.onSurface}
        modifiers={[
          frame({ width: size, height: size }),
          ...(accessibilityLabel ? [accessibilityLabelModifier(accessibilityLabel)] : []),
        ]}
      />
    </InlineHost>
  );
}
