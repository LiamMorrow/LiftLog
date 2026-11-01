import {
  nativeIconButtonHostStyle,
  nativeIconButtonSize,
  NativeIconButtonProps,
  NativeIconButtonVariant,
} from './native-icon-button-props';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Button, Host, Image } from '@expo/ui/swift-ui';
import {
  accessibilityIdentifier,
  accessibilityLabel,
  buttonBorderShape,
  buttonStyle,
  contentShape,
  disabled as disabledModifier,
  frame,
  shapes,
  tint,
} from '@expo/ui/swift-ui/modifiers';

const styleForVariant: Record<NativeIconButtonVariant, Parameters<typeof buttonStyle>[0]> = {
  standard: 'plain',
  filled: 'borderedProminent',
  tonal: 'bordered',
  outlined: 'bordered',
};

export function NativeIconButton({
  label,
  onPress,
  systemImage,
  variant = 'standard',
  disabled,
  testID,
}: NativeIconButtonProps) {
  const { colors } = useAppTheme();

  return (
    <Host seedColor={colors.seedColor} colorScheme={colors.scheme} style={nativeIconButtonHostStyle}>
      <Button
        onPress={onPress}
        modifiers={[
          buttonStyle(styleForVariant[variant]),
          buttonBorderShape('circle'),
          tint(colors.primary),
          accessibilityLabel(label),
          ...(disabled ? [disabledModifier(true)] : []),
          ...(testID ? [accessibilityIdentifier(testID)] : []),
        ]}
      >
        <Image
          systemName={systemImage}
          size={20}
          color={variant === 'standard' ? colors.onSurfaceVariant : undefined}
          modifiers={[
            frame({ width: nativeIconButtonSize, height: nativeIconButtonSize }),
            contentShape(shapes.circle()),
          ]}
        />
      </Button>
    </Host>
  );
}
