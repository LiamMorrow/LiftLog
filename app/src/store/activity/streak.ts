import { DayOfWeek, LocalDate } from '@js-joda/core';
import { Session } from '@/models/session-models';
import { weekStart } from '@/store/activity/week-start';

export type StreakState =
  /** Already trained this week, so the streak is safe regardless of what happens next. */
  | 'secured'
  /** Not trained yet this week, but there's a streak running and the week isn't over. Never render this as broken. */
  | 'in_progress'
  /** No streak to speak of. Render nothing rather than a "0-week streak". */
  | 'none';

type StreakSession = Pick<Session, 'date' | 'isStarted'>;

export interface StreakStats {
  /** Completed weeks in a row with at least one workout, not counting the current one. */
  weeks: number;
  state: StreakState;
  /** Whether any session has ever been started, streak or not. */
  hasHistory: boolean;
}

/**
 * Weeks, not days: a daily streak punishes rest days, which are part of training. One workout keeps a week,
 * so a deload or a busy week never breaks it.
 */
export function calculateStreak(sessions: StreakSession[], firstDayOfWeek: DayOfWeek, today: LocalDate): StreakStats {
  const trainedWeeks = new Set(
    sessions.filter((x) => x.isStarted).map((x) => weekStart(x.date, firstDayOfWeek).toString()),
  );

  if (trainedWeeks.size === 0) {
    return { weeks: 0, state: 'none', hasHistory: false };
  }

  const currentWeekStart = weekStart(today, firstDayOfWeek);
  let weeks = 0;
  for (let week = currentWeekStart.minusWeeks(1); trainedWeeks.has(week.toString()); week = week.minusWeeks(1)) {
    weeks++;
  }

  const state: StreakState = trainedWeeks.has(currentWeekStart.toString())
    ? 'secured'
    : weeks > 0
      ? 'in_progress'
      : 'none';

  return { weeks, state, hasHistory: true };
}
