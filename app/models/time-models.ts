import { LocalDate } from '@js-joda/core';

export interface LocalDateRange {
  from: LocalDate;
  to: LocalDate;
}

export function isLocalDateRange(val: unknown): val is LocalDateRange {
  return (
    typeof val === 'object' &&
    val !== null &&
    'from' in val &&
    'to' in val &&
    val.from instanceof LocalDate &&
    val.to instanceof LocalDate
  );
}

export function isLocalDateRangeEqual(
  a: LocalDateRange,
  b: LocalDateRange,
): boolean {
  return a.from.equals(b.from) && a.to.equals(b.to);
}
