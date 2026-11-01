import {
  defaultIconSize,
  nativeIconButtonHostStyle,
  NativeIconButtonProps,
  NativeIconButtonVariant,
} from './native-icon-button-props';
import { useAppTheme } from '@/hooks/useAppTheme';
import {
  FilledIconButton,
  FilledTonalIconButton,
  Host,
  Icon,
  IconButton,
  OutlinedIconButton,
} from '@expo/ui/jetpack-compose';
import { size, testID as testIDModifier } from '@expo/ui/jetpack-compose/modifiers';

const buttonForVariant = {
  standard: IconButton,
  filled: FilledIconButton,
  tonal: FilledTonalIconButton,
  outlined: OutlinedIconButton,
} satisfies Record<NativeIconButtonVariant, unknown>;

export function NativeIconButton(props: NativeIconButtonProps) {
  const { colors } = useAppTheme();
  const variant = props.variant ?? 'standard';
  const MaterialIconButton = buttonForVariant[variant];
  const iconSize = props.iconSize ?? defaultIconSize;
  const containerSize = iconSize + 16;

  return (
    <Host seedColor={colors.seedColor} colorScheme={colors.scheme} style={nativeIconButtonHostStyle(props)}>
      <MaterialIconButton
        onClick={props.onPress}
        enabled={!props.disabled}
        colors={{
          contentColor: props.colors?.content ?? (variant === 'standard' ? colors.onSurfaceVariant : undefined),
          containerColor: props.colors?.container,
        }}
        modifiers={[size(containerSize, containerSize), ...(props.testID ? [testIDModifier(props.testID)] : [])]}
      >
        <Icon source={props.icon} size={iconSize} contentDescription={props.label} />
      </MaterialIconButton>
    </Host>
  );
}
