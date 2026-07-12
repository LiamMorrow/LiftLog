import {
  isSelectPickerValueEqual,
  SelectPickerProps,
  SelectPickerValue,
} from '@/components/presentation/foundation/select-picker-props';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Host, Picker } from '@expo/ui';

export default function SelectPicker<T extends SelectPickerValue>({
  value,
  options,
  onChange,
  enabled,
  appearance = 'menu',
  testID,
}: SelectPickerProps<T>) {
  const { colors } = useAppTheme();
  const items = options.filter((x) => !x.disabledAndHidden);
  const selectedIndex = items.findIndex((x) => isSelectPickerValueEqual(x.value, value));

  return (
    <Host matchContents seedColor={colors.seedColor}>
      <Picker
        selectedValue={String(selectedIndex)}
        onValueChange={(key) => {
          const selected = items[Number(key)];
          if (selected) {
            onChange(selected.value);
          }
        }}
        enabled={enabled}
        appearance={appearance}
        testID={testID}
      >
        {items.map((option, index) => (
          <Picker.Item key={option.label} label={option.label} value={String(index)} />
        ))}
      </Picker>
    </Host>
  );
}
