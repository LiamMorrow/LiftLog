import CardActions from '@/components/presentation/foundation/card-actions';
import { Card, CardContent } from '@/components/presentation/foundation/card';
import { useConfirm } from '@/hooks/useConfirm';
import EmptyInfo from '@/components/presentation/foundation/empty-info';
import { NativeIconButton } from '@/components/presentation/foundation/native-icon-button';
import ShareIcon from '@expo/material-symbols/share.xml';
import PlayCircleIcon from '@expo/material-symbols/play_circle.xml';
import EditIcon from '@expo/material-symbols/edit.xml';
import AddIcon from '@expo/material-symbols/add.xml';
import { NativeButton } from '@/components/presentation/foundation/native-button';
import DeleteIcon from '@expo/material-symbols/delete.xml';
import { HistoryActivityCalendar } from '@/components/smart/history-activity-calendar';
import { PrStrip } from '@/components/smart/pr-badges';
import { WhoElseTrained } from '@/components/smart/who-else-trained';
import { ReactionSummary } from '@/components/smart/reaction-summary';
import LimitedHtml from '@/components/presentation/foundation/limited-html';
import SessionSummary from '@/components/presentation/summary/session-summary';
import SessionSummaryTitle from '@/components/presentation/summary/session-summary-title';
import SplitCardControl from '@/components/presentation/foundation/split-card-control';
import { useStreakToolbarItem } from '@/components/smart/streak-toolbar-item';
import { AppText } from '@/components/presentation/foundation/app-text';
import { SectionHeader } from '@/components/presentation/foundation/section-header';
import TouchableRipple from '@/components/presentation/foundation/touchable-ripple';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
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
import { useTranslate } from '@tolgee/react';
import { Stack, useRouter } from 'expo-router';
import { useDeferredValue, useState } from 'react';
import { View } from 'react-native';
import { LegendList } from '@legendapp/list/react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeIcon } from '@/components/presentation/foundation/native-icon';
import CloseIcon from '@expo/material-symbols/close.xml';
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
  const { colors } = useAppTheme();
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
  const { streak: streakStats, personalRecords } = useOwnHistory();
  const listedMonthName = formatDate(listedYearMonth.atDay(1), { month: 'long' });
  const streakToolbarItem = useStreakToolbarItem(streakStats);
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
  const confirm = useConfirm();
  const deleteWorkout = (session: Session) =>
    confirm({
      title: t('workout.delete.confirm.title'),
      message: t('workout.delete.confirm.body', {
        sessionName: session.blueprint.name,
        date: formatDate(session.date, { day: 'numeric', month: 'long', year: 'numeric' }),
      }),
      okText: t('generic.delete.button'),
      destructive: true,
      onOk: () => {
        dispatch(deleteStoredSession(session.id));
        dispatch(addUnpublishedSessionId(session.id));
        dispatch(removeReactionsForEvents([session.id]));
      },
    });

  const startWorkout = (session: Session) => {
    const start = () => {
      startWorkoutSession(session.withNothingCompleted().with({ date: LocalDate.now(), id: uuid() }));
      push('/(tabs)/(session)/session', { withAnchor: true });
    };
    if (!currentWorkoutSession) {
      start();
      return;
    }
    confirm({
      title: t('workout.replace_current.confirm.title'),
      message: t('workout.replace_in_progress.confirm.body'),
      okText: t('generic.replace.button'),
      destructive: true,
      onOk: start,
    });
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
      <Stack.Toolbar placement="right">{streakToolbarItem}</Stack.Toolbar>
      <LegendList
        testID="history-list"
        maintainVisibleContentPosition={false}
        data={visibleSessions}
        extraData={personalRecords}
        keyExtractor={(session) => session.id}
        onScroll={handleScroll}
        contentContainerStyle={{
          paddingHorizontal: spacing.pageHorizontalMargin,
          paddingTop: spacing.pageVerticalMargin,
          paddingBottom: insets.bottom + spacing.pageVerticalMargin,
        }}
        ItemSeparatorComponent={() => <View style={{ height: spacing[2] }} />}
        ListHeaderComponent={
          <View style={{ gap: spacing[4], marginBottom: spacing[2] }}>
            <HistoryActivityCalendar
              currentYearMonth={currentYearMonth}
              selectedDate={selectedDate}
              onMonthChange={(yearMonth) => {
                setCurrentYearMonth(yearMonth);
                setSelectedDate(undefined);
              }}
              onDateToggle={(date) => setSelectedDate((current) => (current?.isEqual(date) ? undefined : date))}
            />
            {selectedDate ? (
              <View style={{ gap: spacing[1] }}>
                <SelectedDayChip date={selectedDate} onClear={() => setSelectedDate(undefined)} />
                <WhoElseTrained date={selectedDate} />
              </View>
            ) : (
              visibleSessions.length > 0 && (
                <SectionHeader
                  title={
                    visibleSessions.length === 1
                      ? t('history.month.workouts.one', { month: listedMonthName })
                      : t('history.month.workouts.other', {
                          count: visibleSessions.length.toString(),
                          month: listedMonthName,
                        })
                  }
                />
              )
            )}
          </View>
        }
        renderItem={({ item: session }) => (
          <Card>
            <CardContent style={{ paddingBottom: 0 }}>
              <SplitCardControl
                titleContent={<SessionSummaryTitle showDate session={session} />}
                mainContent={
                  <View style={{ gap: spacing[3] }}>
                    <SessionSummary isFilled showWeight showSets session={session} />
                    <PrStrip records={personalRecords.get(session.id)} scope="history" />
                  </View>
                }
              />
              <ReactionSummary eventId={session.id} />
            </CardContent>
            <CardActions style={{ marginTop: spacing[2] }}>
              <NativeIconButton
                icon={ShareIcon}
                systemImage="square.and.arrow.up"
                colors={{ content: colors.primary }}
                label={t('workout.share_workout.button')}
                onPress={() => handleSharePress(session)}
              />
              <NativeIconButton
                icon={PlayCircleIcon}
                systemImage="play.circle"
                colors={{ content: colors.primary }}
                label={t('workout.start_this.button')}
                onPress={() => startWorkout(session)}
              />
              <NativeIconButton
                icon={DeleteIcon}
                systemImage="trash"
                colors={{ content: colors.primary }}
                label={t('generic.delete.button')}
                onPress={() => deleteWorkout(session)}
              />
              <NativeButton
                icon={EditIcon}
                systemImage="pencil"
                testID="history-edit-workout"
                label={t('workout.edit.button')}
                onPress={() => onSelectSession(session)}
              />
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
              <NativeButton
                icon={AddIcon}
                systemImage="plus"
                testID="history-add-workout-on-day"
                label={t('history.calendar.add_workout.button')}
                onPress={() => createSessionAtDate(listedDate)}
              />
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
    </>
  );
}

function SelectedDayChip({ date, onClear }: { date: LocalDate; onClear: () => void }) {
  const { t } = useTranslate();
  const { colors } = useAppTheme();
  const formatDate = useFormatDate();

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: colors.secondaryContainer,
      }}
    >
      <TouchableRipple
        onPress={onClear}
        accessibilityRole="button"
        accessibilityHint={t('history.calendar.clear_day.button')}
        testID="history-clear-day"
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing[1],
            height: 32,
            paddingLeft: spacing[3],
            paddingRight: spacing[2],
          }}
        >
          <AppText variant="labelLarge" color="onSecondaryContainer">
            {formatDate(date, {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: date.year() !== LocalDate.now().year() ? 'numeric' : undefined,
            })}
          </AppText>
          <NativeIcon icon={CloseIcon} systemImage="xmark" size={18} color={colors.onSecondaryContainer} />
        </View>
      </TouchableRipple>
    </View>
  );
}
