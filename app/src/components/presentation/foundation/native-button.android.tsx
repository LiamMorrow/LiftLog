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

  return (
    <Host matchContents seedColor={colors.seedColor} style={style}>
      <MaterialButton onClick={onPress} enabled={!disabled}>
        <Row horizontalArrangement={{ spacedBy: spacing[2] }} verticalAlignment="center">
          {icon !== undefined && <Icon source={icon} size={18} />}
          <Text>{label}</Text>
        </Row>
      </MaterialButton>
    </Host>
  );
}
