import { SwitchProps } from './switch-props';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Host, Toggle } from '@expo/ui/swift-ui';
import { accessibilityIdentifier, disabled, labelsHidden } from '@expo/ui/swift-ui/modifiers';

export function Switch(props: SwitchProps) {
  const { colors } = useAppTheme();
  return (
    <Host matchContents seedColor={colors.seedColor} colorScheme={colors.scheme}>
      <Toggle
        isOn={props.value}
        onIsOnChange={props.onValueChange}
        modifiers={[
          labelsHidden(),
          disabled(props.disabled ?? false),
          ...(props.testID ? [accessibilityIdentifier(props.testID)] : []),
        ]}
      />
    </Host>
  );
}
