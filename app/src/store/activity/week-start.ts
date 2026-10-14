import { DayOfWeek, LocalDate } from '@js-joda/core';

export function weekStart(date: LocalDate, firstDayOfWeek: DayOfWeek): LocalDate {
  const delta = (date.dayOfWeek().value() - firstDayOfWeek.value() + 7) % 7;
  return date.minusDays(delta);
}
