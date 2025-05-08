import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import HistoryCalendarCard from '@/components/presentation/history-calendar-card';
import { Session } from '@/models/session-models';
import { resolveServices } from '@/services';
import { YearMonth } from '@js-joda/core';
import { useTranslate } from '@tolgee/react';
import { Stack, useFocusEffect } from 'expo-router';
import { useState } from 'react';

export default function History() {
  const { t } = useTranslate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentYearMonth, setCurrentYearMonth] = useState(YearMonth.now());
  useFocusEffect(() => {
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
          currentYearMonth={currentYearMonth}
          sessions={sessions}
          onDateSelect={() => {}}
          onMonthChange={setCurrentYearMonth}
          onSessionLongPress={() => {}}
          onSessionPress={() => {}}
        />
      </FullHeightScrollView>
    </>
  );
}
