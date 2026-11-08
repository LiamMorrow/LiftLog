import { LocalDate } from '@js-joda/core';

export interface DatePickerProps {
  value: LocalDate;
  onChange: (value: LocalDate) => void;
  testID?: string;
}
