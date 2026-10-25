import { describe, expect, it } from 'vitest';
import { DayOfWeek, LocalDate } from '@js-joda/core';
import { MovementKey, ProgressionKey } from '@/models/blueprint-models';
import { ownHistoryOf } from '@/store/activity';
import { Performance } from '@/store/stats/personal-records';

const today = LocalDate.of(2025, 4, 10);
const trained = (id: string, date: LocalDate, volumeKg: number) => ({ id, date, volumeKg });
const performed = (sessionId: string, exerciseOrd: number, exerciseName: string, kg: number): Performance => ({
  sessionId,
  exerciseOrd,
  exerciseName,
  movementKey: exerciseName as MovementKey,
  progressionKey: exerciseName as ProgressionKey,
  resistance: 'external',
  topWeightKg: kg,
  workingWeightKg: kg,
  totalReps: 5,
  bestSetReps: 5,
  oneRepMaxKg: kg,
});

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
    expect(ownHistoryOf([trained('a', today, 100)], [], DayOfWeek.MONDAY, today).streak.state).toBe('secured');
  });

  it('groups records by session', () => {
    const { personalRecords } = ownHistoryOf(
      [],
      [
        performed('before', 0, 'Squat', 110),
        performed('before', 1, 'Bench', 80),
        performed('a', 0, 'Squat', 120),
        performed('a', 1, 'Bench', 90),
      ],
      DayOfWeek.MONDAY,
      today,
    );

    expect(personalRecords.get('a')?.map((x) => `${x.exerciseName} ${x.kind}`)).toEqual([
      'Squat heaviest',
      'Squat oneRepMax',
      'Bench heaviest',
      'Bench oneRepMax',
    ]);
  });
});
