import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import HistoryCalendarCard from '@/components/presentation/history-calendar-card';
import { useAppSelector } from '@/store';
import { deleteStoredSession, selectSessions } from '@/store/stored-sessions';
import { YearMonth } from '@js-joda/core';
import { useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

export default function History() {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const [currentYearMonth, setCurrentYearMonth] = useState(YearMonth.now());
  const sessions = useAppSelector(selectSessions);
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
            dispatch(deleteStoredSession(s.id));
          }}
          onSessionSelect={() => {}}
        />
      </FullHeightScrollView>
    </>
  );
}
