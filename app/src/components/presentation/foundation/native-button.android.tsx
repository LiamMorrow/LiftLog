import { NativeButtonProps, NativeButtonVariant } from '@/components/presentation/foundation/native-button-props';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { Button, FilledTonalButton, Host, Icon, OutlinedButton, Row, Text, TextButton } from '@expo/ui/jetpack-compose';

const buttonForVariant = {
  filled: Button,
  tonal: FilledTonalButton,
  outlined: OutlinedButton,
  text: TextButton,
} satisfies Record<NativeButtonVariant, unknown>;

export default function NativeButton({ label, onPress, icon, variant = 'filled', disabled, style }: NativeButtonProps) {
  const { colors } = useAppTheme();
  const MaterialButton = buttonForVariant[variant];

  // Material colours a button's text from its own content colour, but an icon is drawn with the
  // tint it is given, so it has to be told which surface it sits on.
  const contentColor = {
    filled: colors.onPrimary,
    tonal: colors.onSecondaryContainer,
    outlined: colors.primary,
    text: colors.primary,
  }[variant];

  return (
    <Host matchContents seedColor={colors.seedColor} style={style}>
      <MaterialButton onClick={onPress} enabled={!disabled}>
        <Row horizontalArrangement={{ spacedBy: spacing[2] }} verticalAlignment="center">
          {icon !== undefined && <Icon source={icon} size={18} tint={contentColor} />}
          <Text>{label}</Text>
        </Row>
      </MaterialButton>
    </Host>
  );
}
