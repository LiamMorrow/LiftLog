import { DayOfWeek, Duration, LocalDate } from '@js-joda/core';
import { match } from 'ts-pattern';

export function formatDate(date: LocalDate, opts: Intl.DateTimeFormatOptions) {
  return new Date(
    date.year(),
    date.month().ordinal(),
    date.dayOfMonth(),
  ).toLocaleString(undefined, opts);
}

export function getDateOnDay(dayOfWeek: DayOfWeek) {
  // Super gross and hacky, but then we get i18n formatting for free
  const constantSundayDay = LocalDate.of(2025, 5, 4);
  const dateWithSpecifiedDayOfWeek = constantSundayDay.plusDays(
    dayOfWeek.value(),
  );
  return dateWithSpecifiedDayOfWeek;
}

export default function formatDuration(
  duration: Duration,
  truncateToMins = false,
) {
  const str = match({ duration, truncateToMins })
    .with(
      { truncateToMins: true },
      () => `${Math.floor(duration.toMinutes())} mins`,
    )
    .when(
      ({ duration }) => duration.toHours() >= 1,
      () => `${duration.toHours()} hrs`,
    )
    .when(
      ({ duration }) => duration.toMinutes() >= 1,
      () => `${duration.toMinutes()} mins`,
    )
    .otherwise(() => `${duration.toMillis() / 1000} secs`);

  return str;
}
