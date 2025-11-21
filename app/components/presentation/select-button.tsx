import { DayOfWeek, Period } from '@js-joda/core';
import { useState } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { Menu } from 'react-native-paper';
import Button from '@/components/presentation/gesture-wrappers/button';

export interface SelectButtonOption<T> {
  value: T;
  label: string;
  disabledAndHidden?: true;
}
interface SelectButtonProps<T> {
  value: T;
  options: SelectButtonOption<T>[];
  onChange: (value: T) => void;
  testID?: string;
}
export default function SelectButton<
  T extends number | string | Period | undefined | DayOfWeek,
>({ value, options, onChange, testID }: SelectButtonProps<T>) {
  const valueLabel = options.find((x) => isEqual(x.value, value))?.label;
  const [open, setOpen] = useState(false);
  return (
    <Menu
      visible={open}
      onDismiss={() => {
        setOpen(false);
      }}
      anchor={
        <Button
          testID={testID!}
          icon={open ? 'arrowDropUp' : 'arrowDropDown'}
          onPress={() => setOpen(true)}
          contentStyle={{ flexDirection: 'row-reverse' }}
        >
          {valueLabel}
        </Button>
      }
      anchorPosition="bottom"
    >
      <ScrollView>
        {options.map(
          (option) =>
            !option.disabledAndHidden && (
              <Menu.Item
                key={option.label}
                title={option.label}
                onPress={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                trailingIcon={option.value === value ? 'check' : undefined!}
              />
            ),
        )}
      </ScrollView>
    </Menu>
  );
}

function isEqual<T extends number | string | Period | undefined | DayOfWeek>(
  a: T,
  b: T,
): boolean {
  if (a === b) {
    return true;
  }
  if (a && typeof a === 'object' && a.equals(b)) {
    return true;
  }
  return false;
}
