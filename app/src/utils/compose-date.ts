import { LocalDate } from '@js-joda/core';

export function fromComposeDate(date: Date): LocalDate {
  return LocalDate.of(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}
