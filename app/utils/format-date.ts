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

export function formatDuration(duration: Duration, truncateToMins = false) {
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

/**
 * Takes a string formatted by the csharp format string: @"d\.hh\:mm\:ss\:FFF"
 * and returns a js joda duration
 * Days and milliseconds are optional (e.g., "02:30:45" or "1.02:30:45:123")
 */
export function parseDuration(val: string): Duration {
  // Regex with optional days and milliseconds
  const regex = /^(?:(\d+)\.)?(\d{2}):(\d{2}):(\d{2})(?::(\d{3}))?$/;
  const matchResult = val.match(regex);

  if (!matchResult) {
    throw new Error(`Invalid duration format: ${val}`);
  }

  const [, daysStr, hoursStr, minutesStr, secondsStr, millisStr] = matchResult;

  const days = daysStr ? Number(daysStr) : 0;
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  const seconds = Number(secondsStr);
  const millis = millisStr ? Number(millisStr) : 0;

  return Duration.ofDays(days)
    .plusHours(hours)
    .plusMinutes(minutes)
    .plusSeconds(seconds)
    .plusMillis(millis);
}
