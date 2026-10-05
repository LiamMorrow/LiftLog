import { readPersonalRecords, readStartedSessionVolumes } from '@/db/sessions';
import { useSessionsQuery } from '@/hooks/useSessionsQuery';
import { useToday } from '@/hooks/useToday';
import { useAppSelector } from '@/store';
import { OwnHistory, ownHistoryOf } from '@/store/activity';
import { DayOfWeek, LocalDate } from '@js-joda/core';
import { createContext, ReactNode, useContext } from 'react';

const OwnHistoryContext = createContext<OwnHistory | undefined>(undefined);

const noHistory = ownHistoryOf([], [], DayOfWeek.MONDAY, LocalDate.EPOCH_0);

/** Reads what the screen's activity views need from your finished sessions, aggregated in SQL. */
export function OwnHistoryProvider({ children }: { children: ReactNode }) {
  const today = useToday();
  const firstDayOfWeek = useAppSelector((x) => x.settings.firstDayOfWeek);
  const ownHistory = useSessionsQuery(
    (db) => ownHistoryOf(readStartedSessionVolumes(db), readPersonalRecords(db), firstDayOfWeek, today),
    `${firstDayOfWeek.toString()}:${today.toString()}`,
  );

  return <OwnHistoryContext.Provider value={ownHistory ?? noHistory}>{children}</OwnHistoryContext.Provider>;
}

export function useOwnHistory(): OwnHistory {
  const ownHistory = useContext(OwnHistoryContext);
  if (!ownHistory) {
    throw new Error('useOwnHistory must be used within OwnHistoryProvider');
  }
  return ownHistory;
}
