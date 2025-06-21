import CardList from '@/components/presentation/card-list';
import EmptyInfo from '@/components/presentation/empty-info';
import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import HistoryCalendarCard from '@/components/presentation/history-calendar-card';
import LimitedHtml from '@/components/presentation/limited-html';
import ListTitle from '@/components/presentation/list-title';
import SessionSummary from '@/components/presentation/session-summary';
import SessionSummaryTitle from '@/components/presentation/session-summary-title';
import SplitCardControl from '@/components/presentation/split-card-control';
import { spacing } from '@/hooks/useAppTheme';
import { Session } from '@/models/session-models';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import { setCurrentSession } from '@/store/current-session';
import {
  deleteStoredSession,
  selectSessions,
  selectSessionsInMonth,
} from '@/store/stored-sessions';
import { formatDate } from '@/utils/format-date';
import { LocalDate, YearMonth } from '@js-joda/core';
import { useTranslate } from '@tolgee/react';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Card } from 'react-native-paper';
import { useDispatch } from 'react-redux';

export default function History() {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const [currentYearMonth, setCurrentYearMonth] = useState(YearMonth.now());
  const latesBodyweight = useAppSelector((x) =>
    x.program.upcomingSessions
      .map((x) => x.at(0)?.bodyweight)
      .unwrapOr(undefined),
  );
  const sessions = useAppSelector(selectSessions);
  const sessionsInMonth = useAppSelectorWithArg(
    selectSessionsInMonth,
    currentYearMonth,
  );
  const { push } = useRouter();
  const onSelectSession = (session: Session) => {
    dispatch(setCurrentSession({ target: 'historySession', session }));
    push('/history/edit');
  };
  const createSessionAtDate = (date: LocalDate) => {
    const newSession = Session.freeformSession(date, latesBodyweight);
    onSelectSession(newSession);
  };
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
          onDateSelect={createSessionAtDate}
          onMonthChange={setCurrentYearMonth}
          onDeleteSession={(s) => {
            dispatch(deleteStoredSession(s.id));
          }}
          onSessionSelect={onSelectSession}
        />
        <ListTitle title={t('SessionsInMonth')} />
        <CardList
          items={sessionsInMonth}
          cardType="outlined"
          onPress={onSelectSession}
          renderItemContent={(session) => (
            <Card.Content>
              <SplitCardControl
                titleContent={
                  <SessionSummaryTitle isFilled session={session} />
                }
                mainContent={
                  <SessionSummary isFilled showWeight session={session} />
                }
              />
            </Card.Content>
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
