import { DayOfWeek, LocalDate, YearMonth } from '@js-joda/core';

export function weekStart(date: LocalDate, firstDayOfWeek: DayOfWeek): LocalDate {
  const delta = (date.dayOfWeek().value() - firstDayOfWeek.value() + 7) % 7;
  return date.minusDays(delta);
}

export function weeksInMonth(yearMonth: YearMonth, firstDayOfWeek: DayOfWeek): number {
  const leadingDays = (yearMonth.atDay(1).dayOfWeek().value() - firstDayOfWeek.value() + 7) % 7;
  return Math.ceil((leadingDays + yearMonth.lengthOfMonth()) / 7);
}
