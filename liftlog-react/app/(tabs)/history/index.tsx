import CardList from '@/components/presentation/card-list';
import EmptyInfo from '@/components/presentation/empty-info';
import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import HistoryCalendarCard from '@/components/presentation/history-calendar-card';
import ItemList from '@/components/presentation/item-list';
import ItemTitle from '@/components/presentation/item-title';
import LabelledForm from '@/components/presentation/labelled-form';
import LabelledFormRow from '@/components/presentation/labelled-form-row';
import LimitedHtml from '@/components/presentation/limited-html';
import ListTitle from '@/components/presentation/list-title';
import SessionSummary from '@/components/presentation/session-summary';
import SessionSummaryTitle from '@/components/presentation/session-summary-title';
import SplitCardControl from '@/components/presentation/split-card-control';
import { spacing } from '@/hooks/useAppTheme';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import {
  deleteStoredSession,
  selectSessions,
  selectSessionsInMonth,
} from '@/store/stored-sessions';
import { formatDate } from '@/utils/format-date';
import { YearMonth } from '@js-joda/core';
import { useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

export default function History() {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const [currentYearMonth, setCurrentYearMonth] = useState(YearMonth.now());
  const sessions = useAppSelector(selectSessions);
  const sessionsInMonth = useAppSelectorWithArg(
    selectSessionsInMonth,
    currentYearMonth,
  );
  return (
    <>
      <Stack.Screen
        options={{
          title: t('History'),
        }}
      />
      <FullHeightScrollView contentContainerStyle={{ gap: spacing[4] }}>
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
        <ListTitle title={t('SessionsInMonth')} />
        <CardList
          items={sessionsInMonth}
          cardType="outlined"
          renderItem={(session) => (
            <SplitCardControl
              titleContent={<SessionSummaryTitle isFilled session={session} />}
              mainContent={
                <SessionSummary isFilled showWeight session={session} />
              }
            />
          )}
          emptyTemplate={
            <EmptyInfo>
              <LimitedHtml
                value={t('NoSessionsInMonth{Month}', {
                  0: formatDate(currentYearMonth.atDay(1), {
                    month: 'long',
                  }),
                })}
              />
            </EmptyInfo>
          }
        />
      </FullHeightScrollView>
    </>
  );
}
