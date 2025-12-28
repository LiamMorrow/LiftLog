import { LocalDate } from '@js-joda/core';
import { useAppSelector } from '@/store';

export function useFormatDate(): (
  date: LocalDate,
  opts: Intl.DateTimeFormatOptions,
) => string {
  const locale = useAppSelector((x) => x.settings.preferredLanguage);
  return (date, opts) =>
    new Date(
      date.year(),
      date.month().ordinal(),
      date.dayOfMonth(),
    ).toLocaleString(locale, opts);
}
