import { describe, expect, it } from 'vitest';
import { DayOfWeek, LocalDate, OffsetDateTime } from '@js-joda/core';
import BigNumber from 'bignumber.js';
import { calculateStreak } from '@/store/activity/streak';
import { RecordedWeightedExercise, Session } from '@/models/session-models';
import { ProgressionRule, Rest, SessionBlueprint } from '@/models/blueprint-models';
import { filledPotentialSet, makeWeightedBlueprint } from '@/models/session-models/__test__/helpers';

const MONDAY = DayOfWeek.MONDAY;

/** A session with one completed set, so `isStarted` is true. */
function sessionOn(date: LocalDate, id = date.toString()): Session {
  const blueprint = makeWeightedBlueprint({
    name: 'Squat',
    repsConfig: { type: 'fixed', reps: 5 },
    progression: [ProgressionRule.load(new BigNumber(2.5), { type: 'lowestSets', pick: 'middle' })],
    restBetweenSets: Rest.long,
  });
  const time = OffsetDateTime.parse('2026-01-01T10:00:00Z');
  const exercise = new RecordedWeightedExercise(blueprint, [filledPotentialSet(5, time)], undefined);

  return new Session(id, new SessionBlueprint('Day', [], ''), [exercise], date, undefined, undefined);
}

/** `daysPerWeek[i]` days trained in the week starting `weeksAgo - i` weeks before `today`'s week. */
function sessionsForWeeks(today: LocalDate, daysPerWeek: number[]): Session[] {
  const currentWeekStart = today.minusDays((today.dayOfWeek().value() - MONDAY.value() + 7) % 7);
  const sessions: Session[] = [];

  daysPerWeek.forEach((days, index) => {
    const weekStart = currentWeekStart.minusWeeks(daysPerWeek.length - 1 - index);
    for (let day = 0; day < days; day++) {
      sessions.push(sessionOn(weekStart.plusDays(day), `${weekStart.toString()}-${day}`));
    }
  });

  return sessions;
}

// A Wednesday, so the current week is genuinely mid-flight.
const TODAY = LocalDate.of(2026, 7, 8);

describe('calculateStreak', () => {
  it('reports no streak for someone with no history', () => {
    const stats = calculateStreak([], MONDAY, TODAY);

    expect(stats.state).toBe('none');
    expect(stats.weeks).toBe(0);
    expect(stats.hasHistory).toBe(false);
  });

  it('counts the run of completed weeks with any workout in them', () => {
    const stats = calculateStreak(sessionsForWeeks(TODAY, [1, 2, 1, 4, 0]), MONDAY, TODAY);

    expect(stats.weeks).toBe(4);
  });

  it('keeps the streak through a one-workout week', () => {
    const stats = calculateStreak(sessionsForWeeks(TODAY, [4, 1, 4, 0]), MONDAY, TODAY);

    expect(stats.weeks).toBe(3);
  });

  it('breaks the streak on a week with no workout', () => {
    const stats = calculateStreak(sessionsForWeeks(TODAY, [3, 0, 3, 0]), MONDAY, TODAY);

    expect(stats.weeks).toBe(1);
  });

  it('never lets the current week break a streak', () => {
    const stats = calculateStreak(sessionsForWeeks(TODAY, [1, 1, 1, 1, 0]), MONDAY, TODAY);

    expect(stats.state).toBe('in_progress');
    expect(stats.weeks).toBe(4);
  });

  it('secures the streak once there is a workout this week', () => {
    const stats = calculateStreak(sessionsForWeeks(TODAY, [1, 1, 1]), MONDAY, TODAY);

    expect(stats.state).toBe('secured');
    expect(stats.weeks).toBe(2);
  });

  it('starts a streak with the first workout this week', () => {
    const stats = calculateStreak(sessionsForWeeks(TODAY, [1, 0, 1]), MONDAY, TODAY);

    expect(stats.state).toBe('secured');
    expect(stats.weeks).toBe(0);
  });

  it('reports no streak rather than a zero-week one when the run has been broken', () => {
    const stats = calculateStreak(sessionsForWeeks(TODAY, [5, 5, 0, 0]), MONDAY, TODAY);

    expect(stats.weeks).toBe(0);
    expect(stats.state).toBe('none');
  });

  it('has history once any session is started, even long ago', () => {
    expect(calculateStreak([sessionOn(TODAY.minusWeeks(30))], MONDAY, TODAY).hasHistory).toBe(true);
  });

  it('honours a non-Monday first day of week', () => {
    const sunday = sessionOn(LocalDate.of(2026, 7, 5));

    expect(calculateStreak([sunday], MONDAY, TODAY)).toMatchObject({ state: 'in_progress', weeks: 1 });
    expect(calculateStreak([sunday], DayOfWeek.SUNDAY, TODAY)).toMatchObject({ state: 'secured', weeks: 0 });
  });
});
