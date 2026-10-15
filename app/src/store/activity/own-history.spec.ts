import { describe, expect, it } from 'vitest';
import { DayOfWeek, LocalDate } from '@js-joda/core';
import { ownHistoryOf } from '@/store/activity';

const today = LocalDate.of(2025, 4, 10);
const trained = (id: string, date: LocalDate, volumeKg: number) => ({ id, date, volumeKg });

describe('ownHistoryOf', () => {
  it('sums the sessions on each day', () => {
    const { days } = ownHistoryOf(
      [trained('morning', today, 1000), trained('evening', today, 500), trained('yesterday', today.minusDays(1), 0)],
      [],
      DayOfWeek.MONDAY,
      today,
    );

    expect(days.get(today.toString())).toEqual({ sessionCount: 2, volume: 1500 });
    expect(days.get(today.minusDays(1).toString())).toEqual({ sessionCount: 1, volume: 0 });
  });

  it('has no volume scale until a session is started', () => {
    expect(ownHistoryOf([], [], DayOfWeek.MONDAY, today).volumeScale).toBeUndefined();
    expect(ownHistoryOf([trained('a', today, 100)], [], DayOfWeek.MONDAY, today).volumeScale).toBeDefined();
  });

  it('counts this week towards the streak', () => {
    expect(ownHistoryOf([trained('a', today, 100)], [], DayOfWeek.MONDAY, today).streak.currentWeekCount).toBe(1);
  });

  it('groups records by session', () => {
    const { personalRecords } = ownHistoryOf(
      [],
      [
        { sessionId: 'a', exerciseName: 'Squat', oneRepMaxKg: 120 },
        { sessionId: 'a', exerciseName: 'Bench', oneRepMaxKg: 90 },
      ],
      DayOfWeek.MONDAY,
      today,
    );

    expect(personalRecords.get('a')?.map((x) => x.exerciseName)).toEqual(['Squat', 'Bench']);
  });
});
