import { glassButtonStyle } from '@/components/presentation/foundation/glass-button-style';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
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

type Colors = ReturnType<typeof useAppTheme>['colors'];

function appearance(variant: NativeButtonVariant, floating: boolean | undefined, colors: Colors) {
  const floats = floating && (variant === 'filled' || variant === 'tonal');
  if (floats && isLiquidGlassAvailable()) {
    return variant === 'filled'
      ? { style: glassButtonStyle('prominent'), tint: colors.primary, label: colors.onPrimary }
      : { style: glassButtonStyle('regular'), tint: colors.primary, label: undefined };
  }
  if (floats && variant === 'tonal') {
    return {
      style: buttonStyle('borderedProminent'),
      tint: colors.secondaryContainer,
      label: colors.onSecondaryContainer,
    };
  }
  return {
    style: buttonStyle(styleForVariant[variant]),
    tint: colors.primary,
    label: variant === 'filled' ? colors.onPrimary : undefined,
  };
}

export function NativeButton({
  label,
  onPress,
  systemImage,
  variant = 'filled',
  disabled,
  loading,
  compact,
  floating,
  contentColor,
  testID,
  style,
}: NativeButtonProps) {
  const { colors } = useAppTheme();
  const inactive = disabled || loading;
  const tintsLabel = variant === 'text' || variant === 'outlined';
  const look = appearance(variant, floating, colors);
  const labelColor = contentColor ?? look.label;

  return (
    <InlineHost matchContents style={style}>
      <Button
        label={loading ? undefined : label}
        systemImage={loading ? undefined : systemImage}
        onPress={onPress}
        modifiers={[
          look.style,
          controlSize(compact ? 'small' : 'regular'),
          tint((tintsLabel && contentColor) || look.tint),
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
