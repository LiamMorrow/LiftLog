import { LocalDate } from '@js-joda/core';

export function formatDate(date: LocalDate, opts: Intl.DateTimeFormatOptions) {
  return new Date(
    date.year(),
    date.month().ordinal(),
    date.dayOfMonth(),
  ).toLocaleString('default', opts);
}
