import { isLocalDateRange, isLocalDateRangeEqual, LocalDateRange } from '@/models/time-models';
import { DayOfWeek, Period } from '@js-joda/core';

export type SelectPickerValue = number | string | Period | undefined | DayOfWeek | LocalDateRange;

export interface SelectPickerOption<T> {
  value: T;
  label: string;
  disabledAndHidden?: true;
}

export interface SelectPickerProps<T extends SelectPickerValue> {
  value: T;
  options: SelectPickerOption<T>[];
  onChange: (value: T) => void;
  enabled?: boolean;
  appearance?: 'menu' | 'wheel';
  testID?: string;
}

export function isSelectPickerValueEqual<T extends SelectPickerValue>(a: T, b: T): boolean {
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
