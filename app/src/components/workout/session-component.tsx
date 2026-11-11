import { showSnackbar } from '@/store/app';
import { Card, CardContent } from '@/components/foundation/card';
import { NativeIcon } from '@/components/foundation/native-icon';
import NotesIcon from '@expo/material-symbols/notes.xml';
import { useDispatch } from 'react-redux';
import { View } from 'react-native';
import EmptyInfo from '@/components/foundation/empty-info';
import { useAppTheme, spacing } from '@/hooks/useAppTheme';
import { T, useTranslate } from '@tolgee/react';
import ItemList from '@/components/foundation/item-list';
import { RecordedCardioExercise, RecordedExercise, RecordedWeightedExercise, Session } from '@/models/session-models';
import { CardioTimer } from '@/components/workout/cardio/cardio-timer';
import WeightDisplay from '@/components/foundation/editors/weight-display';
import BigNumber from 'bignumber.js';
import RestTimer from '@/components/workout/rest-timer';
import { FloatingPane } from '@/components/foundation/floating-pane';
import { EditDockHost, EditDockProvider } from '@/components/foundation/edit-dock';
import { SessionExercise, updateCardioSet } from '@/components/workout/session-exercise';
import { CheerBanner } from '@/components/feed/cheer-banner';
import { useArrivingCheers } from '@/hooks/useArrivingCheers';
import { ReactNode } from 'react';
import { SupersetGroup } from '@/components/workout/superset-group';
import { ExerciseGroup, groupSupersets } from '@/utils/superset-groups';
import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import { OffsetDateTime } from '@js-joda/core';
import { useAppSelector } from '@/store';
import { readLatestExercises, readPreviousExercises } from '@/db/sessions';
import { nextRecordedExercise } from '@/services/session-service';
import { deloadDifference } from '@/models/deload';
import { DeloadNotice } from '@/components/workout/deload-notice';
import { switchToNormalWorkout } from '@/store/stored-sessions';
import { useSessionsQuery } from '@/hooks/useSessionsQuery';
import { PageActions } from '@/components/foundation/page-actions';
import AddIcon from '@expo/material-symbols/add.xml';
import { AppText } from '@/components/foundation/app-text';
import { match, P } from 'ts-pattern';
import WeightFormat from '@/components/foundation/weight-format';
import { formatDuration } from '@/utils/format-date';
import { useAddExercise } from '@/hooks/useAddExercise';

export default function SessionComponent(props: {
  session: Session;
  /**
   * Takes a reducer rather than a value so consecutive edits compose against whatever the owner
   * currently holds. Omit it for a session the user does not own, which makes the screen read-only.
   */
  updateSession?: (update: (session: Session) => Session) => void;
  /** The workout being performed right now: rest timers, live timestamps, previous performances. */
  isActiveWorkout?: boolean;
  showBodyweight: boolean;
  header?: ReactNode;
  openPostWorkoutSummary?: () => void;
  /** Renders without its own scroll view, for a read-only session inside a page that scrolls. */
  embedded?: boolean;
}) {
  const { session, isActiveWorkout } = props;
  const { colors } = useAppTheme();
  const { t } = useTranslate();
  const restTimersEnabled = useAppSelector((x) => x.settings.restTimersEnabled);
  const { cheers: arrivingCheers, dismiss: dismissCheers } = useArrivingCheers(
    isActiveWorkout ? session.id : undefined,
  );
  const dispatch = useDispatch();
  const isReadonly = !props.updateSession;
  const editableSessionId = isReadonly ? undefined : session.id;
  const progressionKeys = [...new Set(session.recordedExercises.map((x) => x.progressionKey()))];
  const previousExercises = useSessionsQuery(
    (db) => readPreviousExercises(db, progressionKeys, session.id),
    `${session.id}:${progressionKeys.join('\n')}`,
  );
  const latestExercisesForDeload = useSessionsQuery(
    (db) => (isActiveWorkout && session.deload ? readLatestExercises(db, progressionKeys) : undefined),
    `${session.id}:${isActiveWorkout && session.deload}:${progressionKeys.join('\n')}`,
  );
  const defaultWeightUnit = useAppSelector((x) => (x.settings.useImperialUnits ? 'pounds' : 'kilograms'));
  const deloadCaption = (exercise: RecordedExercise): string | undefined => {
    if (!latestExercisesForDeload || !(exercise instanceof RecordedWeightedExercise)) {
      return undefined;
    }
    const normal = nextRecordedExercise(
      exercise.blueprint,
      latestExercisesForDeload[exercise.progressionKey()],
      defaultWeightUnit,
    );
    const difference = normal instanceof RecordedWeightedExercise ? deloadDifference(exercise, normal) : undefined;
    return match(difference)
      .with({ type: 'weight' }, ({ normal }) =>
        t('workout.deload.normally_weight.label', { weight: normal.shortLocaleFormat() }),
      )
      .with({ type: 'sets' }, ({ normal }) => t('workout.deload.normally_sets.label', { count: normal }))
      .with(undefined, () => undefined)
      .exhaustive();
  };
  const addExercise = useAddExercise(editableSessionId);
  const updateSession = (reducer: (session: Session) => Session) => props.updateSession?.(reducer);
  const resetTimer = (time: OffsetDateTime | undefined) => {
    updateSession((s) => s.withRestTimerAt(time));
  };
  const dismissTimer = () => {
    const dismissedTimer = session.restTimer;
    resetTimer(undefined);
    dispatch(
      showSnackbar({
        text: t('rest_timer.dismissed.message'),
        action: t('generic.undo.button'),
        onAction: () => updateSession((s) => s.with({ restTimer: dismissedTimer })),
      }),
    );
  };
  const toggleRestTimerPaused = () => {
    updateSession((s) => s.with({ restTimer: s.restTimer?.togglePause(OffsetDateTime.now()) }));
  };

  const notesComponent = session.blueprint.notes ? (
    <Card
      style={{
        marginVertical: spacing[2],
        marginHorizontal: spacing.pageHorizontalMargin,
      }}
    >
      <CardContent
        style={{
          gap: spacing[4],
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <NativeIcon icon={NotesIcon} systemImage="text.alignleft" size={20} />
        <View style={{ flex: 1 }}>
          <AppText variant="bodyLarge">{session.blueprint.notes}</AppText>
        </View>
      </CardContent>
    </Card>
  ) : null;

  const emptyInfo =
    session.recordedExercises.length === 0 ? (
      <EmptyInfo style={{ marginVertical: spacing[8] }}>
        <AppText variant="bodyLarge">
          {t('workout.contains_no_exercises.message')} {'\n'}
        </AppText>
        <AppText variant="bodyLarge">{t('exercise.add_hint.body')}</AppText>
      </EmptyInfo>
    ) : null;

  const renderGroup = (group: ExerciseGroup) => {
    const exercises = group.members.map(({ index, label }) => {
      const exercise = session.recordedExercises[index]!;
      return (
        <SessionExercise
          key={index}
          exercise={exercise}
          index={index}
          exerciseCount={session.recordedExercises.length}
          supersetLabel={label}
          toStartNext={nextExercise === exercise}
          isReadonly={isReadonly}
          isActiveWorkout={!!isActiveWorkout}
          editableSessionId={editableSessionId}
          sessionDate={session.date}
          lastCompletedAt={isActiveWorkout ? undefined : lastExercise?.latestTime}
          previousLineageExercise={previousExercises?.[exercise.progressionKey()]}
          deloadCaption={deloadCaption(exercise)}
          updateSession={updateSession}
        />
      );
    });
    return group.isSuperset ? <SupersetGroup>{exercises}</SupersetGroup> : exercises;
  };

  const bodyweight = props.showBodyweight ? (
    <Card style={{ marginHorizontal: spacing.pageHorizontalMargin }} testID="bodyweight-card">
      <CardContent
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <AppText variant="titleLarge">{t('exercise.bodyweight.label')}</AppText>
        <WeightDisplay
          allowNull={true}
          weight={session.bodyweight}
          updateWeight={(bodyweight) => updateSession((s) => s.with({ bodyweight }))}
          increment={new BigNumber('0.1')}
          label={t('exercise.bodyweight.label')}
        />
      </CardContent>
    </Card>
  ) : null;

  const lastExercise = session.lastExercise;
  const nextExercise = session.nextExercise;

  // A weighted exercise rests per exercise; cardio rests per set, and may not rest at all.
  const restBetweenSets = match(lastExercise)
    .with(P.instanceOf(RecordedWeightedExercise), (exercise) => exercise.blueprint.restBetweenSets)
    .with(P.instanceOf(RecordedCardioExercise), (exercise) => exercise.lastCompletedSet?.blueprint.restBetweenSets)
    .otherwise(() => undefined);

  const showRestTimer = restTimersEnabled && isActiveWorkout && nextExercise && restBetweenSets && session.restTimer;
  const cheerBanner = arrivingCheers.length ? (
    <CheerBanner cheers={arrivingCheers} onDismiss={dismissCheers} />
  ) : undefined;
  const restTimer = showRestTimer ? (
    <RestTimer
      banner={cheerBanner}
      rest={restBetweenSets}
      startTime={session.restTimer.startedAt}
      pausedAt={session.restTimer.pausedAt}
      failed={session.lastSetFailed}
      onRestart={() => resetTimer(OffsetDateTime.now())}
      onDismiss={dismissTimer}
      onTogglePause={toggleRestTimerPaused}
    />
  ) : undefined;

  const runningCardio = isActiveWorkout ? session.runningCardioSet : undefined;
  const cardioTimer = runningCardio ? (
    <CardioTimer
      banner={cheerBanner}
      set={runningCardio.set}
      onPersist={() =>
        updateCardioSet(updateSession, runningCardio.exerciseIndex, runningCardio.setIndex, (s) =>
          s.withTimerReanchored(OffsetDateTime.now()),
        )
      }
      onStop={() =>
        updateCardioSet(updateSession, runningCardio.exerciseIndex, runningCardio.setIndex, (s) =>
          s.withTimerStopped(OffsetDateTime.now()),
        )
      }
    />
  ) : undefined;

  const timer = cardioTimer ?? restTimer;
  const accessory = timer ?? (cheerBanner ? <FloatingPane>{cheerBanner}</FloatingPane> : undefined);

  // The timer rides above the action, so the action stays put whether or not a rest is running.
  const floatingBottomContainer = isReadonly ? null : (
    <EditDockHost>
      <PageActions
        accessory={accessory}
        primaryExpanded={!timer}
        primary={{
          label: t('exercise.add.title'),
          icon: AddIcon,
          systemImage: 'plus',
          onPress: addExercise,
        }}
      />
    </EditDockHost>
  );

  const workoutSummary = (
    <Card
      onPress={isActiveWorkout ? props.openPostWorkoutSummary : undefined}
      style={{ margin: spacing.pageHorizontalMargin }}
    >
      <CardContent>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <AppText variant="bodyMedium">
            <T keyName="workout.total_weight_lifted.label" />
          </AppText>
          <WeightFormat fontWeight="bold" color="primary" weight={session.totalWeightLifted} decimalPlaces={0} />
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <AppText variant="bodyMedium">
            <T keyName="workout.total_time.label" />
          </AppText>
          <AppText variant="bodyMedium" style={{ color: colors.primary, fontWeight: 'bold' }}>
            {(session.duration && formatDuration(session.duration, 'hours-mins')) || '-'}
          </AppText>
        </View>
      </CardContent>
    </Card>
  );

  const content = (
    <>
      {props.header}
      {session.deload ? (
        <DeloadNotice
          onSwitchToNormal={
            isActiveWorkout && !isReadonly ? () => dispatch(switchToNormalWorkout(session.id)) : undefined
          }
        />
      ) : undefined}
      {notesComponent}
      {emptyInfo}
      <ItemList items={groupSupersets(session.recordedExercises)} renderItem={renderGroup} />
      {bodyweight}
      {workoutSummary}
    </>
  );

  if (props.embedded) {
    return content;
  }

  return (
    <EditDockProvider>
      <FullHeightScrollView floatingChildren={floatingBottomContainer}>{content}</FullHeightScrollView>
    </EditDockProvider>
  );
}
