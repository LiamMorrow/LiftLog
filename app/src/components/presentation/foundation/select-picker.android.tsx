import {
  isSelectPickerValueEqual,
  SelectPickerProps,
  SelectPickerValue,
} from '@/components/presentation/foundation/select-picker-props';
import { useAppTheme } from '@/hooks/useAppTheme';
import { DropdownMenu, DropdownMenuItem, Host, Text, TextButton } from '@expo/ui/jetpack-compose';
import { useState } from 'react';

export default function SelectPicker<T extends SelectPickerValue>({
  value,
  options,
  onChange,
  enabled = true,
}: SelectPickerProps<T>) {
  const { colors } = useAppTheme();
  const [expanded, setExpanded] = useState(false);
  const items = options.filter((x) => !x.disabledAndHidden);
  const selectedLabel = items.find((x) => isSelectPickerValueEqual(x.value, value))?.label ?? '';

  return (
    <Host matchContents seedColor={colors.seedColor}>
      <DropdownMenu expanded={expanded} onDismissRequest={() => setExpanded(false)}>
        <DropdownMenu.Trigger>
          <TextButton onClick={enabled ? () => setExpanded(true) : undefined}>
            <Text>{selectedLabel}</Text>
          </TextButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Items>
          {items.map((option) => (
            <DropdownMenuItem
              key={option.label}
              onClick={() => {
                onChange(option.value);
                setExpanded(false);
              }}
            >
              <DropdownMenuItem.Text>
                <Text>{option.label}</Text>
              </DropdownMenuItem.Text>
            </DropdownMenuItem>
          ))}
        </DropdownMenu.Items>
      </DropdownMenu>
    </Host>
  );
}
