import { useState } from 'react';
import { Button, Menu } from 'react-native-paper';

export interface SelectButtonOption<T> {
  value: T;
  label: string;
}
interface SelectButtonProps<T> {
  value: T;
  options: SelectButtonOption<T>[];
  onChange: (value: T) => void;
}
export default function SelectButton<T>({
  value,
  options,
  onChange,
}: SelectButtonProps<T>) {
  const valueLabel = options.find((x) => x.value === value)?.label;
  const [open, setOpen] = useState(false);
  return (
    <Menu
      visible={open}
      onDismiss={() => setOpen(false)}
      anchor={
        <Button
          icon={open ? 'arrowDropUp' : 'arrowDropDown'}
          onPress={() => setOpen(true)}
          contentStyle={{ flexDirection: 'row-reverse' }}
        >
          {valueLabel}
        </Button>
      }
      anchorPosition="bottom"
    >
      {options.map((option) => (
        <Menu.Item
          key={option.label}
          title={option.label}
          onPress={() => {
            onChange(option.value);
            setOpen(false);
          }}
          trailingIcon={option.value === value ? 'check' : undefined!}
        />
      ))}
    </Menu>
  );
}
