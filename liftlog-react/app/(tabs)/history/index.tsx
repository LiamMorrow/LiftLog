import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import HistoryCalendarCard from '@/components/presentation/history-calendar-card';
import { Session } from '@/models/session-models';
import { resolveServices } from '@/services';
import { deleteSession } from '@/store/current-session';
import { YearMonth } from '@js-joda/core';
import { useTranslate } from '@tolgee/react';
import { Stack, useFocusEffect } from 'expo-router';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

export default function History() {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentYearMonth, setCurrentYearMonth] = useState(YearMonth.now());
  const updateSessions = () =>
    void resolveServices().then(async (x) =>
      setSessions((await x.sessionService.getLatestSessions()).toArray()),
    );
  useFocusEffect(() => {
    updateSessions();
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
          onDeleteSession={(s) => {
            dispatch(deleteSession(s));
            setTimeout(() => updateSessions());
          }}
          onSessionSelect={() => {}}
        />
      </FullHeightScrollView>
    </>
  );
}
