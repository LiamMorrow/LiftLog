import { InlineHost } from '@/components/presentation/foundation/inline-host';
import { SegmentedPickerProps, SegmentedPickerValue } from './segmented-picker-props';
import { Label, Picker } from '@expo/ui/swift-ui';
import { accessibilityIdentifier, disabled as disabledModifier, pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';

export default function SegmentedPicker<T extends SegmentedPickerValue>({
  value,
  options,
  onChange,
  enabled = true,
}: SegmentedPickerProps<T>) {
  const selectedIndex = options.findIndex((x) => x.value === value);

  return (
    <InlineHost matchContents={{ vertical: true }} style={{ width: '100%' }}>
      <Picker
        selection={selectedIndex}
        onSelectionChange={(index) => {
          const selected = options[index];
          if (selected) {
            onChange(selected.value);
          }
        }}
        modifiers={[pickerStyle('segmented'), ...(enabled ? [] : [disabledModifier(true)])]}
      >
        {options.map((option, index) => (
          <Label
            key={String(option.value)}
            title={option.label}
            systemImage={option.systemImage}
            modifiers={[tag(index), ...(option.testID ? [accessibilityIdentifier(option.testID)] : [])]}
          />
        ))}
      </Picker>
    </InlineHost>
  );
}
