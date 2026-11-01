import { InlineHost } from '@/components/presentation/foundation/inline-host';
import { NativeButtonProps, NativeButtonVariant } from './native-button-props';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Button, HStack, ProgressView, Text } from '@expo/ui/swift-ui';
import {
  accessibilityIdentifier,
  buttonStyle,
  controlSize,
  disabled as disabledModifier,
  foregroundStyle,
  tint,
} from '@expo/ui/swift-ui/modifiers';

const styleForVariant: Record<NativeButtonVariant, Parameters<typeof buttonStyle>[0]> = {
  filled: 'borderedProminent',
  tonal: 'bordered',
  outlined: 'bordered',
  // `plain` drops the tint along with the chrome, leaving a label that doesn't read as a button.
  text: 'borderless',
};

export function NativeButton({
  label,
  onPress,
  systemImage,
  variant = 'filled',
  disabled,
  loading,
  compact,
  contentColor,
  testID,
  style,
}: NativeButtonProps) {
  const { colors } = useAppTheme();
  const inactive = disabled || loading;
  const tintsLabel = variant === 'text' || variant === 'outlined';
  const labelColor = contentColor ?? (variant === 'filled' ? colors.onPrimary : undefined);

  return (
    <InlineHost matchContents style={style}>
      <Button
        label={loading ? undefined : label}
        systemImage={loading ? undefined : systemImage}
        onPress={onPress}
        modifiers={[
          buttonStyle(styleForVariant[variant]),
          controlSize(compact ? 'small' : 'regular'),
          tint((tintsLabel && contentColor) || colors.primary),
          ...(labelColor && !tintsLabel && !inactive ? [foregroundStyle(labelColor)] : []),
          ...(inactive ? [disabledModifier(true)] : []),
          ...(testID ? [accessibilityIdentifier(testID)] : []),
        ]}
      >
        {loading ? (
          <HStack spacing={8}>
            <ProgressView />
            <Text>{label}</Text>
          </HStack>
        ) : undefined}
      </Button>
    </InlineHost>
  );
}
