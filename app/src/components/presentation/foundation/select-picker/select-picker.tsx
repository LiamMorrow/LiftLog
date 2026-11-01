import { InlineHost } from '@/components/presentation/foundation/inline-host';
import { isSelectPickerValueEqual, SelectPickerProps, SelectPickerValue } from './select-picker-props';
import { Picker } from '@expo/ui';

export default function SelectPicker<T extends SelectPickerValue>({
  value,
  options,
  onChange,
  enabled,
  appearance = 'menu',
  testID,
}: SelectPickerProps<T>) {
  const items = options.filter((x) => !x.disabledAndHidden);
  const selectedIndex = items.findIndex((x) => isSelectPickerValueEqual(x.value, value));

  return (
    <InlineHost matchContents>
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
    </InlineHost>
  );
}
