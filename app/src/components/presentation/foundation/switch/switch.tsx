import { InlineHost } from '@/components/presentation/foundation/inline-host';
import { SwitchProps } from './switch-props';
import { Toggle } from '@expo/ui/swift-ui';
import { accessibilityIdentifier, disabled, labelsHidden } from '@expo/ui/swift-ui/modifiers';

export function Switch(props: SwitchProps) {
  return (
    <InlineHost matchContents>
      <Toggle
        isOn={props.value}
        onIsOnChange={props.onValueChange}
        modifiers={[
          labelsHidden(),
          disabled(props.disabled ?? false),
          ...(props.testID ? [accessibilityIdentifier(props.testID)] : []),
        ]}
      />
    </InlineHost>
  );
}
