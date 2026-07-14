import {
  SegmentedPickerProps,
  SegmentedPickerValue,
} from '@/components/presentation/foundation/segmented-picker-props';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Host, Label, Picker } from '@expo/ui/swift-ui';
import { accessibilityIdentifier, disabled as disabledModifier, pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';

export default function SegmentedPicker<T extends SegmentedPickerValue>({
  value,
  options,
  onChange,
  enabled = true,
}: SegmentedPickerProps<T>) {
  const { colors } = useAppTheme();
  const selectedIndex = options.findIndex((x) => x.value === value);

  return (
    <Host matchContents={{ vertical: true }} seedColor={colors.seedColor} style={{ width: '100%' }}>
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
    </Host>
  );
}
