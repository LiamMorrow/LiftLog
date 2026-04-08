import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import CardActions from '@/components/presentation/foundation/card-actions';
import CardList from '@/components/presentation/foundation/card-list';
import ConfirmationDialog from '@/components/presentation/foundation/confirmation-dialog';
import EmptyInfo from '@/components/presentation/foundation/empty-info';
import Button from '@/components/presentation/foundation/gesture-wrappers/button';
import IconButton from '@/components/presentation/foundation/gesture-wrappers/icon-button';
import LimitedHtml from '@/components/presentation/foundation/limited-html';
import SplitCardControl from '@/components/presentation/foundation/split-card-control';
import HistoryCalendarCard from '@/components/presentation/summary/history-calendar-card';
import SessionSummaryTitle from '@/components/presentation/summary/session-summary-title';
import SessionSummary from '@/components/presentation/summary/session-summary';
import { spacing } from '@/hooks/useAppTheme';
import { useFormatDate } from '@/hooks/useFormatDate';
import { SharedSession } from '@/models/feed-models';
import { Session } from '@/models/session-models';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import {
  selectCurrentSession,
  setCurrentSession,
} from '@/store/current-session';
import { addUnpublishedSessionId, encryptAndShare } from '@/store/feed';
import {
  deleteStoredSession,
  selectSessions,
  selectSessionsInMonth,
} from '@/store/stored-sessions';
import { uuid } from '@/utils/uuid';
import { LocalDate, YearMonth } from '@js-joda/core';
import { T, useTranslate } from '@tolgee/react';
import { useRouter } from 'expo-router';
import { ReactNode, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Card, Tooltip } from 'react-native-paper';
import { useDispatch } from 'react-redux';

export function HistoryContent(props: {
  header?: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  renderItemActionsLeading?: ((session: Session) => ReactNode) | undefined;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}) {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const formatDate = useFormatDate();
  const { push } = useRouter();
  const [currentYearMonth, setCurrentYearMonth] = useState(YearMonth.now());
  const latestBodyweight = useAppSelector((x) =>
    x.program.upcomingSessions
      .map((session) => session.at(0)?.bodyweight)
      .unwrapOr(undefined),
  );
  const sessions = useAppSelector(selectSessions);
  const sessionsInMonth = useAppSelectorWithArg(
    selectSessionsInMonth,
    currentYearMonth,
  );
  const currentWorkoutSession = useAppSelectorWithArg(
    selectCurrentSession,
    'workoutSession',
  );
  const [replaceCurrentSessionConfirmOpen, setReplaceCurrentSessionConfirmOpen] =
    useState(false);
  const [deleteSelectedWorkoutConfirmOpen, setDeleteSelectedWorkoutConfirmOpen] =
    useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Session>();

  const onSelectSession = (session: Session) => {
    dispatch(setCurrentSession({ target: 'historySession', session }));
    push('/history/edit');
  };

  const createSessionAtDate = (date: LocalDate) => {
    onSelectSession(Session.freeformSession(date, latestBodyweight));
  };

  const deleteWorkout = (session: Session, force = false) => {
    if (!force) {
      setSelectedWorkout(session);
      setDeleteSelectedWorkoutConfirmOpen(true);
      return;
    }

    if (selectedWorkout) {
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
      return;
    }

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
  };

  const handleSharePress = (session: Session) => {
    dispatch(
      encryptAndShare({
        item: new SharedSession(session),
        title: t('workout.shared_item.title'),
      }),
    );
  };

  return (
    <>
      <FullHeightScrollView
        contentContainerStyle={props.contentContainerStyle}
        {...(props.onScroll ? { onScroll: props.onScroll } : {})}
      >
        {props.header}
        <HistoryCalendarCard
          currentYearMonth={currentYearMonth}
          sessions={sessions}
          onDateSelect={createSessionAtDate}
          onMonthChange={setCurrentYearMonth}
          onDeleteSession={deleteWorkout}
          onSessionSelect={onSelectSession}
        />
        <CardList
          testID="history-list"
          items={sessionsInMonth}
          cardType="contained"
          renderItemContent={(session) => (
            <Card.Content>
              <SplitCardControl
                titleContent={<SessionSummaryTitle isFilled session={session} />}
                mainContent={<SessionSummary isFilled showWeight session={session} />}
              />
            </Card.Content>
          )}
          renderItemActions={(session) => (
            <CardActions style={{ marginTop: spacing[2] }}>
              {props.renderItemActionsLeading?.(session)}
              <Tooltip title={t('workout.share_workout.button')}>
                <IconButton
                  icon={'share'}
                  mode="contained"
                  onPress={() => handleSharePress(session)}
                />
              </Tooltip>
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
