import { InlineHost } from '@/components/presentation/foundation/inline-host';
import { NativeButtonProps, NativeButtonVariant } from './native-button-props';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Button } from '@expo/ui/swift-ui';
import { buttonStyle, controlSize, disabled as disabledModifier, tint } from '@expo/ui/swift-ui/modifiers';

const styleForVariant: Record<NativeButtonVariant, Parameters<typeof buttonStyle>[0]> = {
  filled: 'borderedProminent',
  tonal: 'bordered',
  outlined: 'bordered',
  // `plain` drops the tint along with the chrome, leaving a label that doesn't read as a button.
  text: 'borderless',
};

export default function NativeButton({
  label,
  onPress,
  systemImage,
  variant = 'filled',
  disabled,
  style,
}: NativeButtonProps) {
  const { colors } = useAppTheme();

  return (
    <InlineHost matchContents style={style}>
      <Button
        label={label}
        systemImage={systemImage}
        onPress={onPress}
        modifiers={[
          buttonStyle(styleForVariant[variant]),
          controlSize('large'),
          tint(colors.primary),
          ...(disabled ? [disabledModifier(true)] : []),
        ]}
      />
    </InlineHost>
  );
}
