import { LocalTime } from '@js-joda/core';

export const LocalTimeComparer = (
  a: LocalTime | undefined,
  b: LocalTime | undefined,
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
