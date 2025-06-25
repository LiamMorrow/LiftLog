import { DayOfWeek, LocalDate } from '@js-joda/core';

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
