import { NativeButtonProps, NativeButtonVariant } from './native-button-props';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import {
  Button,
  CircularProgressIndicator,
  ElevatedButton,
  FilledTonalButton,
  Icon,
  OutlinedButton,
  Row,
  Text,
  TextButton,
} from '@expo/ui/jetpack-compose';
import { size, testID as testIDModifier } from '@expo/ui/jetpack-compose/modifiers';
import { FloatingHost } from '@/components/presentation/foundation/floating-host';

const buttonForVariant = {
  filled: Button,
  tonal: FilledTonalButton,
  outlined: OutlinedButton,
  text: TextButton,
} satisfies Record<NativeButtonVariant, unknown>;

const iconSize = 18;

type Colors = ReturnType<typeof useAppTheme>['colors'];

function floatingContainer(variant: NativeButtonVariant, colors: Colors) {
  if (variant === 'filled') {
    return { containerColor: colors.primary, contentColor: colors.onPrimary };
  }
  if (variant === 'tonal') {
    return { containerColor: colors.secondaryContainer, contentColor: colors.onSecondaryContainer };
  }
  return undefined;
}

function contentPadding({
  variant,
  compact,
  hasLeading,
}: {
  variant: NativeButtonVariant;
  compact: boolean | undefined;
  hasLeading: boolean | undefined;
}) {
  if (compact) {
    return { start: spacing[2], end: spacing[2], top: spacing[1], bottom: spacing[1] };
  }
  if (!hasLeading) {
    return undefined;
  }
  return variant === 'text'
    ? { start: spacing[3], end: spacing[4], top: spacing[2], bottom: spacing[2] }
    : { start: spacing[4], end: spacing[6], top: spacing[2], bottom: spacing[2] };
}

export function NativeButton({
  label,
  onPress,
  icon,
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
  const floatingColors = floating ? floatingContainer(variant, colors) : undefined;
  const MaterialButton = floatingColors ? ElevatedButton : buttonForVariant[variant];

  return (
    <FloatingHost matchContents style={style}>
      <MaterialButton
        onClick={onPress}
        enabled={!disabled && !loading}
        colors={{ ...floatingColors, contentColor: contentColor ?? floatingColors?.contentColor }}
        contentPadding={contentPadding({ variant, compact, hasLeading: loading || icon !== undefined })}
        modifiers={testID ? [testIDModifier(testID)] : undefined}
      >
        <Row horizontalArrangement={{ spacedBy: spacing[2] }} verticalAlignment="center">
          {loading ? (
            <CircularProgressIndicator strokeWidth={2} modifiers={[size(iconSize, iconSize)]} />
          ) : (
            icon !== undefined && <Icon source={icon} size={iconSize} />
          )}
          <Text>{label}</Text>
        </Row>
      </MaterialButton>
    </FloatingHost>
  );
}
