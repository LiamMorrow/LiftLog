import CardActions from '@/components/presentation/card-actionts';
import CardList from '@/components/presentation/card-list';
import ConfirmationDialog from '@/components/presentation/confirmation-dialog';
import EmptyInfo from '@/components/presentation/empty-info';
import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import IconButton from '@/components/presentation/gesture-wrappers/icon-button';
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
import { addUnpublishedSessionId } from '@/store/feed';
import {
  deleteStoredSession,
  selectSessions,
  selectSessionsInMonth,
} from '@/store/stored-sessions';
import { uuid } from '@/utils/uuid';
import { LocalDate, YearMonth } from '@js-joda/core';
import { T, useTranslate } from '@tolgee/react';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Card, Tooltip } from 'react-native-paper';
import Button from '@/components/presentation/gesture-wrappers/button';
import { useDispatch } from 'react-redux';
import { useFormatDate } from '@/hooks/useFormatDate';

export default function History() {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const formatDate = useFormatDate();
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
  const [
    deleteSelectedWorkoutConfirmOpen,
    setDeleteSelectedWorkoutConfirmOpen,
  ] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Session>();
  const deleteWorkout = (session: Session, force = false) => {
    if (!force) {
      setSelectedWorkout(session);
      setDeleteSelectedWorkoutConfirmOpen(true);
    } else if (selectedWorkout) {
      dispatch(deleteStoredSession(selectedWorkout.id));
      dispatch(addUnpublishedSessionId(selectedWorkout.id));
      setDeleteSelectedWorkoutConfirmOpen(false);
      setSelectedWorkout(undefined);
    }
  };

  const startWorkout = (session: Session, force = false) => {
    if (currentWorkoutSession && !force) {
      setSelectedWorkout(session);
      setReplaceCurrentSessionConfirmOpen(true);
    } else {
      dispatch(
        setCurrentSession({
          target: 'workoutSession',
          session: session
            .withNothingCompleted()
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
          title: t('generic.history.title'),
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
            deleteWorkout(s);
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
            <CardActions style={{ marginTop: spacing[2] }}>
              <Tooltip title={t('workout.start_this.button')}>
                <IconButton
                  mode="contained"
                  icon={'playCircle'}
                  onPress={() => startWorkout(session)}
                />
              </Tooltip>
              <Tooltip title={t('generic.delete.button')}>
                <IconButton
                  mode="contained"
                  icon={'delete'}
                  onPress={() => deleteWorkout(session)}
                />
              </Tooltip>
              <Button
                onPress={() => onSelectSession(session)}
                icon="edit"
                mode="contained"
                testID="history-edit-workout"
              >
                <T keyName="workout.edit.button" />
              </Button>
            </CardActions>
          )}
          emptyTemplate={
            <EmptyInfo>
              <LimitedHtml
                value={t('workout.no_sessions_in_month.message', {
                  month: formatDate(currentYearMonth.atDay(1), {
                    month: 'long',
                  }),
                })}
              />
            </EmptyInfo>
          }
        />
      </FullHeightScrollView>
      <ConfirmationDialog
        headline={t('workout.replace_current.confirm.title')}
        textContent={t('workout.replace_in_progress.confirm.body')}
        open={replaceCurrentSessionConfirmOpen}
        okText={t('generic.replace.button')}
        onOk={() => selectedWorkout && startWorkout(selectedWorkout, true)}
        onCancel={() => {
          setSelectedWorkout(undefined);
          setReplaceCurrentSessionConfirmOpen(false);
        }}
      />
      <ConfirmationDialog
        headline={t('workout.delete.confirm.title')}
        textContent={
          <LimitedHtml
            value={t('workout.delete.confirm.body', {
              sessionName: selectedWorkout?.blueprint.name ?? '',
              date: formatDate(selectedWorkout?.date ?? LocalDate.now(), {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }),
            })}
          />
        }
        open={deleteSelectedWorkoutConfirmOpen}
        okText={t('generic.delete.button')}
        onOk={() => selectedWorkout && deleteWorkout(selectedWorkout, true)}
        onCancel={() => {
          setSelectedWorkout(undefined);
          setDeleteSelectedWorkoutConfirmOpen(false);
        }}
      />
    </>
  );
}
