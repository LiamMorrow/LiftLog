import CardList from '@/components/presentation/card-list';
import ConfirmationDialog from '@/components/presentation/confirmation-dialog';
import EmptyInfo from '@/components/presentation/empty-info';
import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import HistoryCalendarCard from '@/components/presentation/history-calendar-card';
import LimitedHtml from '@/components/presentation/limited-html';
import SessionSummary from '@/components/presentation/session-summary';
import SessionSummaryTitle from '@/components/presentation/session-summary-title';
import SplitCardControl from '@/components/presentation/split-card-control';
import { spacing } from '@/hooks/useAppTheme';
import { Session } from '@/models/session-models';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import {
  selectCurrentSession,
  setCurrentSession,
} from '@/store/current-session';
import { selectSessions, selectSessionsInMonth } from '@/store/stored-sessions';
import { formatDate } from '@/utils/format-date';
import { uuid } from '@/utils/uuid';
import { LocalDate, YearMonth } from '@js-joda/core';
import { T, useTranslate } from '@tolgee/react';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Button, Card, IconButton, Tooltip } from 'react-native-paper';
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
  const currentWorkoutSession = useAppSelectorWithArg(
    selectCurrentSession,
    'workoutSession',
  );
  const onSelectSession = (session: Session) => {
    dispatch(setCurrentSession({ target: 'historySession', session }));
    push('/history/edit');
  };
  const createSessionAtDate = (date: LocalDate) => {
    const newSession = Session.freeformSession(date, latesBodyweight);
    onSelectSession(newSession);
  };
  const [
    replaceCurrentSessionConfirmOpen,
    setReplaceCurrentSessionConfirmOpen,
  ] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Session>();
  const startDeleteSession = (session: Session) => {};

  const startWorkout = (session: Session, force = false) => {
    if (currentWorkoutSession && !force) {
      setSelectedWorkout(session);
      setReplaceCurrentSessionConfirmOpen(true);
    } else {
      dispatch(
        setCurrentSession({
          target: 'workoutSession',
          session: session
            .withNoSetsCompleted()
            .with({ date: LocalDate.now(), id: uuid() }),
        }),
      );
      setReplaceCurrentSessionConfirmOpen(false);
      setSelectedWorkout(undefined);

      push('/(tabs)/(session)/session', { withAnchor: true });
    }
  };
  return (
    <>
      <Stack.Screen
        options={{
          title: t('History'),
        }}
      />
      <FullHeightScrollView
        contentContainerStyle={{
          gap: spacing[4],
          paddingHorizontal: spacing.pageHorizontalMargin,
        }}
      >
        <HistoryCalendarCard
          currentYearMonth={currentYearMonth}
          sessions={sessions}
          onDateSelect={createSessionAtDate}
          onMonthChange={setCurrentYearMonth}
          onDeleteSession={(s) => {
            startDeleteSession(s);
          }}
          onSessionSelect={onSelectSession}
        />
        <CardList
          testID="history-list"
          items={sessionsInMonth}
          cardType="contained"
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
          renderItemActions={(session) => (
            <Card.Actions>
              <Tooltip
                title={t('Start this workout')}
                // @ts-expect-error -- Hack since the card actions does not work on cards with tooltips
                mode="contained"
              >
                <IconButton
                  mode="contained"
                  icon={'playCircle'}
                  onPress={() => startWorkout(session)}
                />
              </Tooltip>
              <Tooltip title={t('Delete')}>
                <IconButton
                  mode="contained"
                  icon={'delete'}
                  onPress={() => startDeleteSession(session)}
                />
              </Tooltip>
              <Button
                onPress={() => onSelectSession(session)}
                icon="edit"
                testID="history-edit-workout"
              >
                <T keyName="Edit workout" />
              </Button>
            </Card.Actions>
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
      <ConfirmationDialog
        headline={t('Replace current workout?')}
        textContent={t(
          'There is already a workout in progress, replace it without saving?',
        )}
        open={replaceCurrentSessionConfirmOpen}
        okText={t('Replace')}
        onOk={() => selectedWorkout && startWorkout(selectedWorkout, true)}
        onCancel={() => {
          setSelectedWorkout(undefined);
          setReplaceCurrentSessionConfirmOpen(false);
        }}
      />
    </>
  );
}
