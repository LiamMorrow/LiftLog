import { DayOfWeek, Period } from '@js-joda/core';
import { useState } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { Menu } from 'react-native-paper';
import Button, {
  ButtonProps,
} from '@/components/presentation/foundation/gesture-wrappers/button';
import {
  isLocalDateRange,
  isLocalDateRangeEqual,
  LocalDateRange,
} from '@/models/time-models';

export interface SelectButtonOption<T> {
  value: T;
  label: string;
  disabledAndHidden?: true;
}
interface SelectButtonProps<T> {
  value: T;
  options: SelectButtonOption<T>[];
  renderLabel?: (value: T) => string;
  onChange: (value: T) => void;
  testID?: string;
  buttonProps?: Partial<Pick<ButtonProps, 'mode'>>;
}
export default function SelectButton<
  T extends number | string | Period | undefined | DayOfWeek | LocalDateRange,
>({
  value,
  options,
  onChange,
  renderLabel,
  testID,
  buttonProps,
}: SelectButtonProps<T>) {
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
          {...buttonProps}
        >
          {renderLabel?.(value) ?? valueLabel}
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

function isEqual<
  T extends number | string | Period | undefined | DayOfWeek | LocalDateRange,
>(a: T, b: T): boolean {
  if (a === b) {
    return true;
  }
  if (isLocalDateRange(a) && isLocalDateRange(b)) {
    return isLocalDateRangeEqual(a, b);
  }
  // One of these isn't one, so if either isn't then we're good to say non equal
  if (isLocalDateRange(b) || isLocalDateRange(a)) {
    return false;
  }
  if (a && typeof a === 'object' && a.equals(b)) {
    return true;
  }
  return false;
}
