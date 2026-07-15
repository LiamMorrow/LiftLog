import { selectCurrentSession, SessionTarget, setCurrentSession } from '@/store/current-session';
import { showSnackbar } from '@/store/app';
import { Card, Icon, Text } from 'react-native-paper';
import { useDispatch, useStore } from 'react-redux';
import { View } from 'react-native';
import EmptyInfo from '@/components/presentation/foundation/empty-info';
import { useAppTheme, spacing, font } from '@/hooks/useAppTheme';
import { T, useTranslate } from '@tolgee/react';
import ItemList from '@/components/presentation/foundation/item-list';
import {
  RecordedCardioExercise,
  RecordedCardioExerciseSet,
  RecordedExercise,
  RecordedWeightedExercise,
  RestTimer as RestTimerModel,
  Session,
} from '@/models/session-models';
import { Updater } from '@/utils/types';
import { CardioTimer } from '@/components/presentation/workout/cardio/cardio-timer';
import WeightedExercise from '@/components/presentation/workout/weighted/weighted-exercise';
import WeightDisplay from '@/components/presentation/foundation/editors/weight-display';
import BigNumber from 'bignumber.js';
import RestTimer from '@/components/presentation/workout/rest-timer';
import { ReactNode } from 'react';
import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import { getSessionExerciseEditorHref } from '@/components/smart/session-exercise-editor';
import { LocalTime, OffsetDateTime, ZoneId } from '@js-joda/core';
import { useRouter } from 'expo-router';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import { selectRecentlyCompletedExercises } from '@/store/stored-sessions';
import { PageActions } from '@/components/presentation/foundation/page-actions';
import AddIcon from '@expo/material-symbols/add.xml';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { match, P } from 'ts-pattern';
import { CardioExercise } from '@/components/presentation/workout/cardio/cardio-exercise';
import WeightFormat from '../presentation/foundation/weight-format';
import { formatDuration } from '@/utils/format-date';
import { useAddExercise } from '@/hooks/useAddExercise';

export default function SessionComponent(props: {
  target: SessionTarget;
  showBodyweight: boolean;
  header?: ReactNode;
  openPostWorkoutSummary?: () => void;
}) {
  const { colors } = useAppTheme();
  const { t } = useTranslate();
  const { getState } = useStore();
  const { push } = useRouter();
  const session = useAppSelectorWithArg(selectCurrentSession, props.target);
  const restTimersEnabled = useAppSelector((x) => x.settings.restTimersEnabled);
  const dispatch = useDispatch();
  const recentlyCompletedExercises = useAppSelectorWithArg(selectRecentlyCompletedExercises, 10);
  const addExercise = useAddExercise(props.target);
  const resetTimer = (time: OffsetDateTime | undefined) => {
    updateSession((s) => s.with({ restTimer: time ? new RestTimerModel(time) : undefined }));
  };
  const dismissTimer = () => {
    withLatestSession((latestSession) => {
      const dismissedTimer = latestSession.restTimer;
      resetTimer(undefined);
      dispatch(
        showSnackbar({
          text: t('rest_timer.dismissed.message'),
          action: t('generic.undo.button'),
          dispatchAction: setCurrentSession({
            session: latestSession.with({ restTimer: dismissedTimer }),
            target: props.target,
          }),
        }),
      );
    });
  };
  const toggleRestTimerPaused = () => {
    updateSession((s) => s.with({ restTimer: s.restTimer?.togglePause(OffsetDateTime.now()) }));
  };
  const withLatestSession = (callback: (session: Session) => void) => {
    // Ensure we always have the latest session, allows us to call callbacks consecutively
    const latestSession = selectCurrentSession(getState(), props.target);
    if (!latestSession) {
      return;
    }
    callback(latestSession);
  };
  const updateSession = (reducer: (session: Session) => Session) => {
    withLatestSession((latestSession) => {
      dispatch(
        setCurrentSession({
          session: reducer(latestSession),
          target: props.target,
        }),
      );
    });
  };

  // Both the set's own tiles and the docked clock write through here, so a set earns its rest
  // whichever way it was filled in.
  const updateCardioSet = (exerciseIndex: number) => (setIndex: number, update: Updater<RecordedCardioExerciseSet>) => {
    const now = OffsetDateTime.now();
    withLatestSession((latestSession) => {
      const before = latestSession.cardioSetAt(exerciseIndex, setIndex);
      const session = latestSession.withCardioSet(exerciseIndex, setIndex, update, now);
      dispatch(setCurrentSession({ session, target: props.target }));

      if (session.cardioSetAt(exerciseIndex, setIndex)?.earnsRest(before)) {
        withLatestSession((s) => resetTimer(s.lastExercise?.latestTime));
      }
    });
  };

  const startCardioTimer = (exerciseIndex: number) => (setIndex: number) =>
    updateSession((s) => s.withCardioTimerStarted(exerciseIndex, setIndex, OffsetDateTime.now()));

  const isReadonly = props.target === 'feedSession' || props.target === 'sharedSession';

  if (!session) {
    return <Text>Loading</Text>;
  }

  const notesComponent = session.blueprint.notes ? (
    <Card
      mode="contained"
      style={{
        marginVertical: spacing[2],
        marginHorizontal: spacing.pageHorizontalMargin,
      }}
    >
      <Card.Content
        style={{
          gap: spacing[4],
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Icon source={'text'} size={20} />
        <View style={{ paddingRight: spacing[2] }}>
          <SurfaceText>{session.blueprint.notes}</SurfaceText>
        </View>
      </Card.Content>
    </Card>
  ) : null;

  const emptyInfo =
    session.recordedExercises.length === 0 ? (
      <EmptyInfo style={{ marginVertical: spacing[8] }}>
        <SurfaceText>
          {t('workout.contains_no_exercises.message')} {'\n'}
        </SurfaceText>
        <SurfaceText>{t('exercise.add_hint.body')}</SurfaceText>
      </EmptyInfo>
    ) : null;

  const renderItem = (item: RecordedExercise, index: number) => {
    return match(item)
      .with(P.instanceOf(RecordedWeightedExercise), (item) => (
        <WeightedExercise
          timeProvider={() =>
            props.target === 'workoutSession'
              ? OffsetDateTime.now()
              : (session.lastExercise?.latestTime ??
                session.date.atTime(LocalTime.now()).atZone(ZoneId.systemDefault()).toOffsetDateTime())
          }
          resetSetTimer={() => withLatestSession((s) => resetTimer(s.lastExercise?.latestTime))}
          recordedExercise={item}
          toStartNext={session.nextExercise === item}
          updateExercise={(update) =>
            updateSession((s) => s.withExercise(index, update(s.recordedExercises[index] as RecordedWeightedExercise)))
          }
          onEditExercise={() => push(getSessionExerciseEditorHref(props.target, index))}
          onRemoveExercise={() => updateSession((s) => s.withRemovedExercise(index))}
          isReadonly={isReadonly}
          showPreviousButton={props.target === 'workoutSession'}
          previousRecordedExercises={recentlyCompletedExercises(item.blueprint) as RecordedWeightedExercise[]}
        />
      ))
      .with(P.instanceOf(RecordedCardioExercise), (item) => (
        <CardioExercise
          recordedExercise={item}
          updateExercise={(ex) =>
            updateSession((s) => s.withExercise(index, ex(s.recordedExercises[index] as RecordedCardioExercise)))
          }
          updateSet={updateCardioSet(index)}
          onStartTimer={startCardioTimer(index)}
          toStartNext={session.nextExercise === item}
          onEditExercise={() => push(getSessionExerciseEditorHref(props.target, index))}
          onRemoveExercise={() => updateSession((s) => s.withRemovedExercise(index))}
          isReadonly={isReadonly}
          showPreviousButton={props.target === 'workoutSession'}
          previousRecordedExercises={recentlyCompletedExercises(item.blueprint) as RecordedCardioExercise[]}
        />
      ))
      .exhaustive();
  };

  const bodyweight = props.showBodyweight ? (
    <Card style={{ marginHorizontal: spacing.pageHorizontalMargin }} mode="contained" testID="bodyweight-card">
      <Card.Content
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text
          style={{
            ...font['text-xl'],
            fontWeight: 'bold',
            color: colors.onSurface,
          }}
        >
          {t('exercise.bodyweight.label')}
        </Text>
        <WeightDisplay
          allowNull={true}
          weight={session.bodyweight}
          updateWeight={(bodyweight) => updateSession((s) => s.with({ bodyweight }))}
          increment={new BigNumber('0.1')}
          label={t('exercise.bodyweight.label')}
        />
      </Card.Content>
    </Card>
  ) : null;

  const lastExercise = session.lastExercise;
  const lastRecordedSet = lastExercise instanceof RecordedWeightedExercise ? lastExercise?.lastRecordedSet : undefined;
  const nextExercise = session.nextExercise;

  // A weighted exercise rests per exercise; cardio rests per set, and may not rest at all.
  const restBetweenSets = match(lastExercise)
    .with(P.instanceOf(RecordedWeightedExercise), (exercise) => exercise.blueprint.restBetweenSets)
    .with(P.instanceOf(RecordedCardioExercise), (exercise) => exercise.lastCompletedSet?.blueprint.restBetweenSets)
    .otherwise(() => undefined);

  const showRestTimer =
    restTimersEnabled && props.target === 'workoutSession' && nextExercise && restBetweenSets && session.restTimer;
  // Only a weighted set can be failed — cardio has no rep count to fall short of.
  const lastSetFailed =
    lastRecordedSet?.set &&
    lastExercise instanceof RecordedWeightedExercise &&
    lastRecordedSet.set.repsCompleted <
      lastExercise.blueprint.repsTargetForSet(lastExercise.potentialSets.indexOf(lastRecordedSet)).min;
  const restTimer = showRestTimer ? (
    <RestTimer
      rest={restBetweenSets}
      startTime={session.restTimer.startedAt}
      pausedAt={session.restTimer.pausedAt}
      failed={!!lastSetFailed}
      onRestart={() => resetTimer(OffsetDateTime.now())}
      onDismiss={dismissTimer}
      onTogglePause={toggleRestTimerPaused}
    />
  ) : undefined;

  const runningCardio = props.target === 'workoutSession' ? session.runningCardioSet : undefined;
  const cardioTimer = runningCardio ? (
    <CardioTimer
      set={runningCardio.set}
      onPersist={() =>
        updateCardioSet(runningCardio.exerciseIndex)(runningCardio.setIndex, (s) =>
          s.withTimerReanchored(OffsetDateTime.now()),
        )
      }
      onStop={() =>
        updateCardioSet(runningCardio.exerciseIndex)(runningCardio.setIndex, (s) =>
          s.withTimerStopped(OffsetDateTime.now()),
        )
      }
    />
  ) : undefined;

  const timer = cardioTimer ?? restTimer;

  // The timer rides above the action, so the action stays put whether or not a rest is running.
  const floatingBottomContainer = isReadonly ? null : (
    <PageActions
      accessory={timer}
      primaryExpanded={!timer}
      primary={{
        label: t('exercise.add.title'),
        icon: AddIcon,
        systemImage: 'plus',
        onPress: addExercise,
      }}
    />
  );

  const workoutSummary = (
    <Card
      mode="contained"
      onPress={props.target === 'workoutSession' ? props.openPostWorkoutSummary : undefined}
      style={{ margin: spacing.pageHorizontalMargin }}
    >
      <Card.Content>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text variant="bodyMedium">
            <T keyName="workout.total_weight_lifted.label" />
          </Text>
          <WeightFormat fontWeight="bold" color="primary" weight={session.totalWeightLifted} decimalPlaces={0} />
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text variant="bodyMedium">
            <T keyName="workout.total_time.label" />
          </Text>
          <Text variant="bodyMedium" style={{ color: colors.primary, fontWeight: 'bold' }}>
            {(session.duration && formatDuration(session.duration, 'hours-mins')) || '-'}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <FullHeightScrollView floatingChildren={floatingBottomContainer}>
      {props.header}
      {notesComponent}
      {emptyInfo}
      <ItemList items={session.recordedExercises} renderItem={renderItem} />
      {bodyweight}
      {workoutSummary}
    </FullHeightScrollView>
  );
}
