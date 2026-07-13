import { LocalDate } from '@js-joda/core';
import { useMemo } from 'react';

/**
 * A referentially stable `today`. Selectors that grade activity take the date as an argument rather than
 * reading the clock themselves, so calling `LocalDate.now()` inline would hand them a fresh object every
 * render and defeat memoization.
 */
export function useToday(): LocalDate {
  return useMemo(() => LocalDate.now(), []);
}
