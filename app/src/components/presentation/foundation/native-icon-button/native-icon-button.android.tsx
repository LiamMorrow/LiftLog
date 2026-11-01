import { nativeIconButtonHostStyle, NativeIconButtonProps, NativeIconButtonVariant } from './native-icon-button-props';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  FilledIconButton,
  FilledTonalIconButton,
  Host,
  Icon,
  IconButton,
  OutlinedIconButton,
} from '@expo/ui/jetpack-compose';
import { testID as testIDModifier } from '@expo/ui/jetpack-compose/modifiers';

const buttonForVariant = {
  standard: IconButton,
  filled: FilledIconButton,
  tonal: FilledTonalIconButton,
  outlined: OutlinedIconButton,
} satisfies Record<NativeIconButtonVariant, unknown>;

export function NativeIconButton({
  label,
  onPress,
  icon,
  variant = 'standard',
  disabled,
  testID,
}: NativeIconButtonProps) {
  const { colors } = useAppTheme();
  const MaterialIconButton = buttonForVariant[variant];

  return (
    <Host seedColor={colors.seedColor} colorScheme={colors.scheme} style={nativeIconButtonHostStyle}>
      <MaterialIconButton
        onClick={onPress}
        enabled={!disabled}
        colors={variant === 'standard' ? { contentColor: colors.onSurfaceVariant } : undefined}
        modifiers={testID ? [testIDModifier(testID)] : undefined}
      >
        <Icon source={icon} size={24} contentDescription={label} />
      </MaterialIconButton>
    </Host>
  );
}
