import { LocalDateTime, LocalTime } from '@js-joda/core';

export const TemporalComparer = <T extends { compareTo: (other: T) => number }>(
  a: T | undefined,
  b: T | undefined,
) => {
  if (a === undefined && b === undefined) {
    return 0;
  }
  if (a === undefined) {
    return 1;
  }
  if (b === undefined) {
    return -1;
  }
  return a.compareTo(b);
};

export const LocalTimeComparer = TemporalComparer<LocalTime>;

export const LocalDateTimeComparer = TemporalComparer<LocalDateTime>;
