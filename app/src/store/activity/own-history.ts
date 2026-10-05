import { DayOfWeek, LocalDate } from '@js-joda/core';
import { PersonalRecordRow, SessionVolume } from '@/db/sessions';
import { Weight } from '@/models/weight';
import { VolumeScale } from '@/store/activity/activity-types';
import { calculateStreak, StreakStats } from '@/store/activity/streak';
import { volumeScaleOf } from '@/store/activity/volume';
import { PersonalRecord } from '@/store/stats/personal-records';

export interface DayActivity {
  sessionCount: number;
  volume: number;
}

/**
 * What the activity views need from your finished sessions.
 */
export interface OwnHistory {
  /** Keyed by ISO date, holding only the days with a started session. */
  days: Map<string, DayActivity>;
  /** Drives how saturated each day's colour pip is*/
  volumeScale: VolumeScale | undefined;
  streak: StreakStats;
  /** All time bests */
  personalRecords: Map<string, PersonalRecord[]>;
}

export function ownHistoryOf(
  startedSessions: SessionVolume[],
  records: PersonalRecordRow[],
  firstDayOfWeek: DayOfWeek,
  today: LocalDate,
): OwnHistory {
  const days = new Map<string, DayActivity>();
  for (const session of startedSessions) {
    const key = session.date.toString();
    const day = days.get(key);
    days.set(key, { sessionCount: (day?.sessionCount ?? 0) + 1, volume: (day?.volume ?? 0) + session.volumeKg });
  }

  const personalRecords = new Map<string, PersonalRecord[]>();
  for (const record of records) {
    personalRecords.set(record.sessionId, [
      ...(personalRecords.get(record.sessionId) ?? []),
      { exerciseName: record.exerciseName, oneRepMax: new Weight(record.oneRepMaxKg, 'kilograms') },
    ]);
  }

  return {
    days,
    volumeScale: startedSessions.length ? volumeScaleOf(startedSessions.map((x) => x.volumeKg)) : undefined,
    streak: calculateStreak(
      startedSessions.map((x) => ({ date: x.date, isStarted: true })),
      firstDayOfWeek,
      today,
    ),
    personalRecords,
  };
}
