import CardActions from '@/components/presentation/foundation/card-actions';
import ConfirmationDialog from '@/components/presentation/foundation/confirmation-dialog';
import EmptyInfo from '@/components/presentation/foundation/empty-info';
import IconButton from '@/components/presentation/foundation/icon-button';
import { HistoryActivityCalendar } from '@/components/smart/history-activity-calendar';
import { HistoryPrBadges } from '@/components/smart/pr-badges';
import { WhoElseTrainedCard } from '@/components/smart/who-else-trained-card';
import { ReactionSummary } from '@/components/smart/reaction-summary';
import LimitedHtml from '@/components/presentation/foundation/limited-html';
import SessionSummary from '@/components/presentation/summary/session-summary';
import SessionSummaryTitle from '@/components/presentation/summary/session-summary-title';
import SplitCardControl from '@/components/presentation/foundation/split-card-control';
import { StreakCard } from '@/components/presentation/summary/streak-card';
import { spacing } from '@/hooks/useAppTheme';
import { useScroll } from '@/hooks/useScrollListener';
import { Session } from '@/models/session-models';
import { useAppSelector } from '@/store';
import { OwnHistoryProvider, useOwnHistory } from '@/components/smart/own-history-provider';
import { useSessionsQuery } from '@/hooks/useSessionsQuery';
import { readSessionsBetween } from '@/db/sessions';
import { TemporalComparer } from '@/models/comparers';
import Enumerable from 'linq';
import { addUnpublishedSessionId, encryptAndShare, removeReactionsForEvents } from '@/store/feed';
import {
  deleteStoredSession,
  getSessionReferenceTime,
  openSession,
  putStoredSession,
  selectActiveSession,
} from '@/store/stored-sessions';
import { uuid } from '@/utils/uuid';
import { LocalDate, YearMonth } from '@js-joda/core';
import { T, useTranslate } from '@tolgee/react';
import { Stack, useRouter } from 'expo-router';
import { useDeferredValue, useState } from 'react';
import { View } from 'react-native';
import { LegendList } from '@legendapp/list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card, Tooltip } from 'react-native-paper';
import Button from '@/components/presentation/foundation/button';
import { useDispatch } from 'react-redux';
import { useFormatDate } from '@/hooks/useFormatDate';
import { useStartWorkout } from '@/hooks/useStartWorkout';
import { SharedSession } from '@/models/feed-models';

const noSessions: Session[] = [];

export default function HistoryPage() {
  return (
    <OwnHistoryProvider>
      <History />
    </OwnHistoryProvider>
  );
}

function History() {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const formatDate = useFormatDate();
  const [currentYearMonth, setCurrentYearMonth] = useState(YearMonth.now());
  const { handleScroll } = useScroll();
  const insets = useSafeAreaInsets();
  const latesBodyweight = useAppSelector((x) =>
    x.program.upcomingSessions.map((x) => x.at(0)?.bodyweight).unwrapOr(undefined),
  );
  const [selectedDate, setSelectedDate] = useState<LocalDate>();
  const listedYearMonth = useDeferredValue(currentYearMonth);
  const listedDate = useDeferredValue(selectedDate);
  const from = listedDate ?? listedYearMonth.atDay(1);
  const to = listedDate ?? listedYearMonth.atEndOfMonth();
  const visibleSessions =
    useSessionsQuery(
      (db) =>
        Enumerable.from(readSessionsBetween(db, from, to))
          .orderByDescending((x) => getSessionReferenceTime(x), TemporalComparer)
          .toArray(),
      `${from.toString()}:${to.toString()}`,
    ) ?? noSessions;
  const streakStats = useOwnHistory().streak;
  const { push } = useRouter();
  const currentWorkoutSession = useAppSelector(selectActiveSession);
  const startWorkoutSession = useStartWorkout();
  const onSelectSession = (session: Session) => {
    dispatch(openSession(session));
    push(`/history/edit?sessionId=${encodeURIComponent(session.id)}`);
  };
  const createSessionAtDate = (date: LocalDate) => {
    const newSession = Session.freeformSession(date, latesBodyweight);
    dispatch(putStoredSession(newSession));
    onSelectSession(newSession);
  };
  const [replaceCurrentSessionConfirmOpen, setReplaceCurrentSessionConfirmOpen] = useState(false);
  const [deleteSelectedWorkoutConfirmOpen, setDeleteSelectedWorkoutConfirmOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Session>();
  const deleteWorkout = (session: Session, force = false) => {
    if (!force) {
      setSelectedWorkout(session);
      setDeleteSelectedWorkoutConfirmOpen(true);
    } else if (selectedWorkout) {
      dispatch(deleteStoredSession(selectedWorkout.id));
      dispatch(addUnpublishedSessionId(selectedWorkout.id));
      dispatch(removeReactionsForEvents([selectedWorkout.id]));
      setDeleteSelectedWorkoutConfirmOpen(false);
      setSelectedWorkout(undefined);
    }
  };

  const startWorkout = (session: Session, force = false) => {
    if (currentWorkoutSession && !force) {
      setSelectedWorkout(session);
      setReplaceCurrentSessionConfirmOpen(true);
    } else {
      startWorkoutSession(session.withNothingCompleted().with({ date: LocalDate.now(), id: uuid() }));
      setReplaceCurrentSessionConfirmOpen(false);
      setSelectedWorkout(undefined);

      push('/(tabs)/(session)/session', { withAnchor: true });
    }
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
      <Stack.Screen
        options={{
          title: t('generic.history.title'),
        }}
      />
      <LegendList
        testID="history-list"
        maintainVisibleContentPosition={false}
        data={visibleSessions}
        keyExtractor={(session) => session.id}
        onScroll={handleScroll}
        contentContainerStyle={{
          paddingHorizontal: spacing.pageHorizontalMargin,
          paddingBottom: insets.bottom,
        }}
        ItemSeparatorComponent={() => <View style={{ height: spacing[2] }} />}
        ListHeaderComponent={
          <View style={{ gap: spacing[4], marginBottom: spacing[4] }}>
            <StreakCard stats={streakStats} />
            <HistoryActivityCalendar
              currentYearMonth={currentYearMonth}
              selectedDate={selectedDate}
              onMonthChange={(yearMonth) => {
                setCurrentYearMonth(yearMonth);
                setSelectedDate(undefined);
              }}
              onDateSelect={setSelectedDate}
            />
            {selectedDate && <WhoElseTrainedCard date={selectedDate} />}
          </View>
        }
        renderItem={({ item: session }) => (
          <Card mode="contained">
            <Card.Content>
              <SplitCardControl
                titleContent={<SessionSummaryTitle showDate session={session} />}
                mainContent={
                  <View style={{ gap: spacing[2] }}>
                    <SessionSummary isFilled showWeight session={session} />
                    <HistoryPrBadges sessionId={session.id} />
                  </View>
                }
              />
              <ReactionSummary eventId={session.id} />
            </Card.Content>
            <CardActions style={{ marginTop: spacing[2] }}>
              <Tooltip title={t('workout.share_workout.button')}>
                <IconButton icon={'share'} mode="contained" onPress={() => handleSharePress(session)} />
              </Tooltip>
              <Tooltip title={t('workout.start_this.button')}>
                <IconButton mode="contained" icon={'playCircle'} onPress={() => startWorkout(session)} />
              </Tooltip>
              <Tooltip title={t('generic.delete.button')}>
                <IconButton mode="contained" icon={'delete'} onPress={() => deleteWorkout(session)} />
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
          </Card>
        )}
        ListEmptyComponent={
          listedDate ? (
            <View style={{ gap: spacing[4], alignItems: 'center' }}>
              <EmptyInfo>
                <LimitedHtml
                  value={t('history.calendar.no_sessions_on_day.message', {
                    date: formatDate(listedDate, { day: 'numeric', month: 'long' }),
                  })}
                />
              </EmptyInfo>
              <Button
                mode="contained"
                icon="plus"
                testID="history-add-workout-on-day"
                onPress={() => createSessionAtDate(listedDate)}
              >
                <T keyName="history.calendar.add_workout.button" />
              </Button>
            </View>
          ) : (
            <EmptyInfo>
              <LimitedHtml
                value={t('workout.no_sessions_in_month.message', {
                  month: formatDate(listedYearMonth.atDay(1), {
                    month: 'long',
                  }),
                })}
              />
            </EmptyInfo>
          )
        }
      />
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
