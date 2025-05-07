import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import HistoryCalendarCard from '@/components/presentation/history-calendar-card';
import { Session } from '@/models/session-models';
import { resolveServices } from '@/services';
import { LocalDate } from '@js-joda/core';
import { useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';
import { useLayoutEffect, useState } from 'react';

export default function History() {
  const { t } = useTranslate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentDate, setCurrentDate] = useState(LocalDate.now());
  useLayoutEffect(() => {
    void resolveServices().then(async (x) =>
      setSessions((await x.sessionService.getLatestSessions()).toArray()),
    );
  });
  return (
    <>
      <Stack.Screen
        options={{
          title: t('History'),
        }}
      />
      <FullHeightScrollView>
        <HistoryCalendarCard
          currentMonth={currentDate.month().value()}
          currentYear={currentDate.year()}
          onDateSelect={() => {}}
          onMonthChange={() => {}}
          onSessionLongPress={() => {}}
          onSessionPress={() => {}}
        />
      </FullHeightScrollView>
    </>
  );
}
