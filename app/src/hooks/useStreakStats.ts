import { readStartedSessionVolumes } from '@/db/sessions';
import { useSessionsQuery } from '@/hooks/useSessionsQuery';
import { useToday } from '@/hooks/useToday';
import { useAppSelector } from '@/store';
import { calculateStreak, StreakStats } from '@/store/activity';

/** The streak alone, for screens that don't need the rest of `OwnHistoryProvider`'s aggregation. */
export function useStreakStats(): StreakStats | undefined {
  const today = useToday();
  const firstDayOfWeek = useAppSelector((x) => x.settings.firstDayOfWeek);
  return useSessionsQuery(
    (db) =>
      calculateStreak(
        readStartedSessionVolumes(db).map((x) => ({ date: x.date, isStarted: true })),
        firstDayOfWeek,
        today,
      ),
    `${firstDayOfWeek.toString()}:${today.toString()}`,
  );
}
