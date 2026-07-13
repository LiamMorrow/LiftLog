import { DayOfWeek, LocalDate } from '@js-joda/core';
import { Session } from '@/models/session-models';
import { weekStart } from '@/store/activity/week-start';

/**
 * How many completed weeks of history the target is derived from. Long enough to smooth out a single bad
 * week, short enough to follow someone who has genuinely changed their training frequency.
 */
const TARGET_WINDOW_WEEKS = 8;

const MIN_WEEKS_FOR_MEDIAN = 2;

const MIN_TARGET = 1;
const MAX_TARGET = 7;

export type StreakState =
  /** This week's target is already met; the streak is safe regardless of what happens next. */
  | 'secured'
  /** Target not met yet, but there's a streak running and the week isn't over. Never render this as broken. */
  | 'in_progress'
  /** No streak to speak of. Render nothing rather than a "0-week streak". */
  | 'none';

export interface StreakStats {
  /** Sessions-per-week bar, derived from the user's own trailing behaviour. */
  target: number;
  /** Completed weeks that met the target, not counting the current one. */
  weeks: number;
  currentWeekCount: number;
  remainingThisWeek: number;
  state: StreakState;
  workoutsLast7Days: number;
}

/** Distinct days trained per week. A two-a-day is one day, so it can't inflate the bar. */
function countDistinctDaysByWeek(
  sessions: Session[],
  firstDayOfWeek: DayOfWeek,
): Map<string, Set<string>> {
  const byWeek = new Map<string, Set<string>>();

  for (const session of sessions) {
    if (!session.isStarted) {
      continue;
    }
    const key = weekStart(session.date, firstDayOfWeek).toString();
    const days = byWeek.get(key);
    if (days) {
      days.add(session.date.toString());
    } else {
      byWeek.set(key, new Set([session.date.toString()]));
    }
  }

  return byWeek;
}

/**
 * The lower median, so a 3/4/4/3 user gets a bar of 3 rather than 4. Deliberately forgiving: the streak is
 * meant to be kept, not lost on a technicality.
 */
function lowerMedian(ascending: number[]): number {
  return ascending[Math.floor((ascending.length - 1) / 2)] ?? 0;
}

/**
 * Weeks, not days. A daily streak punishes rest days, which are part of training — someone running a 4-day
 * split perfectly would see "broken" every week. And a plan gives us no cadence to measure against
 * (ProgramBlueprint is just a rotation, with no days-per-week), so the bar comes from the user's own
 * trailing behaviour instead.
 */
export function calculateStreak(sessions: Session[], firstDayOfWeek: DayOfWeek, today: LocalDate): StreakStats {
  const daysByWeek = countDistinctDaysByWeek(sessions, firstDayOfWeek);
  const currentWeekStart = weekStart(today, firstDayOfWeek);
  const currentWeekCount = daysByWeek.get(currentWeekStart.toString())?.size ?? 0;

  const countForWeek = (start: LocalDate) => daysByWeek.get(start.toString())?.size ?? 0;

  const workoutsLast7Days = new Set(
    sessions
      .filter((x) => x.isStarted && !x.date.isAfter(today) && x.date.isAfter(today.minusDays(7)))
      .map((x) => x.date.toString()),
  ).size;

  const earliest = [...daysByWeek.keys()].sort()[0];
  if (!earliest) {
    return {
      target: MIN_TARGET,
      weeks: 0,
      currentWeekCount: 0,
      remainingThisWeek: MIN_TARGET,
      state: 'none',
      workoutsLast7Days: 0,
    };
  }

  // Completed weeks only: the current week is still in progress and would drag the median down.
  const completedWeeks: number[] = [];
  for (
    let week = LocalDate.parse(earliest);
    week.isBefore(currentWeekStart);
    week = week.plusWeeks(1)
  ) {
    completedWeeks.push(countForWeek(week));
  }

  const window = completedWeeks.slice(-TARGET_WINDOW_WEEKS);
  const target =
    window.length < MIN_WEEKS_FOR_MEDIAN
      ? MIN_TARGET
      : Math.min(MAX_TARGET, Math.max(MIN_TARGET, lowerMedian([...window].sort((a, b) => a - b))));

  // Walk back from the most recent completed week for as long as the target was met.
  let weeks = 0;
  for (let i = completedWeeks.length - 1; i >= 0; i--) {
    if (completedWeeks[i]! < target) {
      break;
    }
    weeks++;
  }

  const remainingThisWeek = Math.max(0, target - currentWeekCount);

  // The current week can never break a streak — it isn't over yet.
  const state: StreakState =
    currentWeekCount >= target && (weeks > 0 || currentWeekCount > 0)
      ? 'secured'
      : weeks > 0
        ? 'in_progress'
        : 'none';

  return {
    target,
    weeks,
    currentWeekCount,
    remainingThisWeek,
    state,
    workoutsLast7Days,
  };
}
