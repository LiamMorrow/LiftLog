import {
  addExercise,
  cycleExerciseReps,
  editExercise,
  notifySetTimer,
  removeExercise,
  selectCurrentSession,
  SessionTarget,
  setCompletionTimeForCardioExercise,
  setExerciseReps,
  setWorkoutSessionLastSetTime,
  updateBodyweight,
  updateCurrentBlockStartTimeForCardioExercise,
  updateDistanceForCardioExercise,
  updateDurationForCardioExercise,
  updateInclineForCardioExercise,
  updateNotesForExercise,
  updateResistanceForCardioExercise,
  updateStepsForCardioExercise,
  updateWeightForCardioExercise,
  updateWeightForSet,
} from '@/store/current-session';
import { Card, FAB, Icon, Text } from 'react-native-paper';
import { useDispatch, useStore } from 'react-redux';
import { Linking, View } from 'react-native';
import EmptyInfo from '@/components/presentation/foundation/empty-info';
import { useAppTheme, spacing, font } from '@/hooks/useAppTheme';
import { useTranslate } from '@tolgee/react';
import ItemList from '@/components/presentation/foundation/item-list';
import {
  RecordedCardioExercise,
  RecordedExercise,
  RecordedWeightedExercise,
} from '@/models/session-models';
import WeightedExercise from '@/components/presentation/workout/weighted/weighted-exercise';
import WeightDisplay from '@/components/presentation/foundation/editors/weight-display';
import BigNumber from 'bignumber.js';
import RestTimer from '@/components/presentation/workout/rest-timer';
import { useState } from 'react';
import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import { ExerciseBlueprint } from '@/models/blueprint-models';
import FullScreenDialog from '@/components/presentation/foundation/full-screen-dialog';
import { ExerciseEditor } from '@/components/presentation/workout-editor/exercise-editor';
import { LocalTime, OffsetDateTime, ZoneId } from '@js-joda/core';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import { UnknownAction } from '@reduxjs/toolkit';
import {
  selectPreviousComparableSession,
  selectRecentlyCompletedExercises,
} from '@/store/stored-sessions';
import FloatingBottomContainer from '@/components/presentation/foundation/floating-bottom-container';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { match, P } from 'ts-pattern';
import { CardioExercise } from '@/components/presentation/workout/cardio/cardio-exercise';
import { DelayRender } from '../presentation/foundation/delay-render';
import { Loader } from '../presentation/foundation/loader';
import SessionComparisonTable from '@/components/presentation/workout/session-comparison-table';

export default function SessionComponent(props: {
  target: SessionTarget;
  showBodyweight: boolean;
  openPostWorkoutSummary?: () => void;
  saveAndClose?: () => void;
}) {
  const { colors } = useAppTheme();
  const useImperialUnits = useAppSelector((x) => x.settings.useImperialUnits);
  const { t } = useTranslate();
  const lastSetTime = useAppSelector(
    (s) => s.currentSession.workoutSessionLastSetTime,
  );
  const session = useAppSelectorWithArg(selectCurrentSession, props.target);
  const store = useStore();
  const storeDispatch = useDispatch();
  const dispatch = <T,>(
    reducer: (a: { payload: T; target: SessionTarget }) => UnknownAction,
    payload: T,
  ) => storeDispatch(reducer({ payload, target: props.target }));
  const recentlyCompletedExercises = useAppSelectorWithArg(
    selectRecentlyCompletedExercises,
    10,
  );
  const previousComparableSession = useAppSelectorWithArg(
    selectPreviousComparableSession,
    session,
  );
  const resetTimer = () => {
    storeDispatch(setWorkoutSessionLastSetTime(OffsetDateTime.now()));
    storeDispatch(notifySetTimer());
  };

  const isReadonly =
    props.target === 'feedSession' || props.target === 'sharedSession';

  const [exerciseToEditIndex, setExerciseToEditIndex] = useState<
    number | undefined
  >(undefined);
  const [editingExerciseBlueprint, setEditingExerciseBlueprint] = useState<
    ExerciseBlueprint | undefined
  >(undefined);
  const [exerciseEditorOpen, setExerciseEditorOpen] = useState(false);
  const openUrl = (url: string) => {
    void Linking.canOpenURL(url).then(() => Linking.openURL(url));
  };

  const handleEditExercise = () => {
    if (editingExerciseBlueprint !== undefined) {
      if (exerciseToEditIndex !== undefined) {
        dispatch(editExercise, {
          exerciseIndex: exerciseToEditIndex,
          newBlueprint: editingExerciseBlueprint,
          useImperialUnits,
        });
        setExerciseToEditIndex(undefined);
      } else {
        dispatch(addExercise, {
          blueprint: editingExerciseBlueprint,
          useImperialUnits,
        });
      }
      setExerciseEditorOpen(false);
    }
  };

  if (!session) {
    return <Text>Loading</Text>;
  }

  const { completedSets, totalSets } = getSessionProgress(session);
  const progress = totalSets === 0 ? 0 : completedSets / totalSets;
  const progressPillHeight = spacing[14];
  const progressPillWidth = progressPillHeight * 2.2;
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

  const updateCompletionTimeAndClearTimer = <T,>(
    exerciseIndex: number,
    cb: (newValue: T, setIndex: number) => void,
  ) => {
    return (newValue: T, setIndex: number) => {
      cb(newValue, setIndex);
      const exercise = selectCurrentSession(store.getState(), props.target)
        ?.recordedExercises[exerciseIndex];
      if (!(exercise instanceof RecordedCardioExercise)) {
        return;
      }
      const set = exercise.sets[setIndex];
      if (!set) {
        return;
      }
      const hasData = !!(
        set.distance ||
        (set.duration && !set.duration.isZero()) ||
        set.incline ||
        set.resistance
      );
      const newCompletionDateTime = hasData
        ? (set.completionDateTime ?? OffsetDateTime.now())
        : undefined;

      dispatch(setCompletionTimeForCardioExercise, {
        exerciseIndex,
        setIndex,
        time: newCompletionDateTime,
      });
    };
  };

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
          recordedExercise={item}
          toStartNext={session.nextExercise === item}
          updateRepCountForSet={(setIndex, reps) => {
            dispatch(setExerciseReps, {
              exerciseIndex: index,
              reps,
              setIndex,
              time:
                props.target === 'workoutSession'
                  ? OffsetDateTime.now()
                  : (session.lastExercise?.latestTime ??
                    session.date
                      .atTime(LocalTime.now())
                      .atZone(ZoneId.systemDefault())
                      .toOffsetDateTime()),
            });
            if (props.target === 'workoutSession')
              storeDispatch(notifySetTimer());
          }}
          cycleRepCountForSet={(setIndex) => {
            dispatch(cycleExerciseReps, {
              exerciseIndex: index,
              setIndex,
              time:
                props.target === 'workoutSession'
                  ? OffsetDateTime.now()
                  : (session.lastExercise?.latestTime ??
                    session.date
                      .atTime(LocalTime.now())
                      .atZone(ZoneId.systemDefault())
                      .toOffsetDateTime()),
            });
            if (props.target === 'workoutSession')
              storeDispatch(notifySetTimer());
          }}
          updateWeightForSet={(setIndex, weight, applyTo) =>
            dispatch(updateWeightForSet, {
              exerciseIndex: index,
              weight,
              setIndex,
              applyTo,
            })
          }
          updateNotesForExercise={(notes) =>
            dispatch(updateNotesForExercise, { notes, exerciseIndex: index })
          }
          onEditExercise={() => {
            setEditingExerciseBlueprint(item.blueprint);
            setExerciseToEditIndex(index);
            setExerciseEditorOpen(true);
          }}
          onRemoveExercise={() =>
            dispatch(removeExercise, {
              exerciseIndex: index,
            })
          }
          onOpenLink={() => {
            openUrl(item.blueprint.link);
          }}
          isReadonly={isReadonly}
          showPreviousButton={props.target === 'workoutSession'}
          previousRecordedExercises={
            recentlyCompletedExercises(
              item.blueprint,
            ) as RecordedWeightedExercise[]
          }
        />
      ))
      .with(P.instanceOf(RecordedCardioExercise), (item) => (
        <CardioExercise
          recordedExercise={item}
          toStartNext={session.nextExercise === item}
          updateDistance={updateCompletionTimeAndClearTimer(
            index,
            (distance, setIndex) =>
              dispatch(updateDistanceForCardioExercise, {
                distance,
                setIndex,
                exerciseIndex: index,
              }),
          )}
          setCurrentBlockStartTime={(time, setIndex) =>
            dispatch(updateCurrentBlockStartTimeForCardioExercise, {
              time,
              setIndex,
              exerciseIndex: index,
            })
          }
          updateDuration={updateCompletionTimeAndClearTimer(
            index,
            (duration, setIndex) =>
              dispatch(updateDurationForCardioExercise, {
                duration,
                setIndex,
                exerciseIndex: index,
              }),
          )}
          updateIncline={updateCompletionTimeAndClearTimer(
            index,
            (incline, setIndex) =>
              dispatch(updateInclineForCardioExercise, {
                incline,
                setIndex,
                exerciseIndex: index,
              }),
          )}
          updateResistance={updateCompletionTimeAndClearTimer(
            index,
            (resistance, setIndex) =>
              dispatch(updateResistanceForCardioExercise, {
                resistance,
                setIndex,
                exerciseIndex: index,
              }),
          )}
          updateWeight={updateCompletionTimeAndClearTimer(
            index,
            (weight, setIndex) =>
              dispatch(updateWeightForCardioExercise, {
                weight,
                setIndex,
                exerciseIndex: index,
              }),
          )}
          updateSteps={updateCompletionTimeAndClearTimer(
            index,
            (steps, setIndex) =>
              dispatch(updateStepsForCardioExercise, {
                steps,
                setIndex,
                exerciseIndex: index,
              }),
          )}
          updateNotesForExercise={(notes) =>
            dispatch(updateNotesForExercise, { notes, exerciseIndex: index })
          }
          onEditExercise={() => {
            setEditingExerciseBlueprint(item.blueprint);
            setExerciseToEditIndex(index);
            setExerciseEditorOpen(true);
          }}
          onRemoveExercise={() =>
            dispatch(removeExercise, {
              exerciseIndex: index,
            })
          }
          onOpenLink={() => {
            openUrl(item.blueprint.link);
          }}
          isReadonly={isReadonly}
          showPreviousButton={props.target === 'workoutSession'}
          previousRecordedExercises={
            recentlyCompletedExercises(
              item.blueprint,
            ) as RecordedCardioExercise[]
          }
        />
      ))
      .exhaustive();
  };

  const bodyWeight = props.showBodyweight ? (
    <Card
      mode="contained"
      style={{ marginHorizontal: spacing.pageHorizontalMargin }}
      testID="bodyweight-card"
    >
      <Card.Content
        style={{
          backgroundColor: colors.surfaceContainer,
          borderColor: colors.outlineVariant,
          borderWidth: 1,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing[3],
          paddingVertical: spacing[3],
        }}
      >
        <Text
          style={{
            ...font['text-xl'],
            fontWeight: 'bold',
            color: colors.onSurface,
            flex: 1,
          }}
        >
          {t('exercise.bodyweight.label')}
        </Text>
        <WeightDisplay
          allowNull={true}
          weight={session.bodyweight}
          updateWeight={(bodyweight) =>
            dispatch(updateBodyweight, { bodyweight })
          }
          increment={new BigNumber('0.1')}
          label={t('exercise.bodyweight.label')}
        />
      </Card.Content>
    </Card>
  ) : null;

  const lastExercise = session.lastExercise;
  const lastRecordedSet =
    lastExercise instanceof RecordedWeightedExercise
      ? lastExercise?.lastRecordedSet
      : undefined;
  const nextExercise = session.nextExercise;
  // We only want to show the rest timer - which is primarily for weights
  // When we are currently working out, and the exercises we are on (or were just on) are weighted - rests for cardio aren't implemented
  const showRestTimer =
    props.target === 'workoutSession' &&
    nextExercise &&
    nextExercise instanceof RecordedWeightedExercise &&
    lastExercise &&
    lastExercise instanceof RecordedWeightedExercise &&
    lastSetTime;
  const lastSetFailed =
    lastRecordedSet?.set &&
    lastExercise &&
    lastExercise instanceof RecordedWeightedExercise &&
    lastRecordedSet.set.repsCompleted < lastExercise.blueprint.repsPerSet;
  const restTimer = showRestTimer ? (
    <View style={{ flex: 1 }}>
      <RestTimer
        rest={lastExercise.blueprint.restBetweenSets}
        startTime={lastSetTime}
        failed={!!lastSetFailed}
        resetTimer={resetTimer}
      />
    </View>
  ) : undefined;
  const saveButton = props.saveAndClose && (
    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
      <FAB
        onPress={props.saveAndClose}
        variant="surface"
        icon={'inventory'}
        testID="save-session-button"
        label={
          props.target === 'workoutSession'
            ? t('generic.finish.button')
            : t('generic.save.button')
        }
      ></FAB>
    </View>
  );

  const progressIndicator =
    props.target === 'workoutSession' && totalSets > 0 ? (
      <View
        style={{
          width: progressPillWidth,
          height: progressPillHeight,
          overflow: 'hidden',
          borderRadius: progressPillHeight,
          backgroundColor: colors.inverseSurface,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${progress * 100}%`,
            backgroundColor: colors.primary,
          }}
        />
        <SurfaceText
          style={{
            fontVariant: ['tabular-nums'],
          }}
          font="text-2xl"
          weight="bold"
          color="inverseOnSurface"
        >
          {completedSets}/{totalSets}
        </SurfaceText>
      </View>
    ) : (
      <View style={{ flex: 1 }} />
    );

  const floatingBottomContainer = isReadonly ? null : (
    <FloatingBottomContainer
      additionalContent={
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing[2],
          }}
        >
          {progressIndicator}
          {restTimer}
          {saveButton}
        </View>
      }
    />
  );

  const totalWeightLifted = (
    <View
      style={{
        marginHorizontal: spacing.pageHorizontalMargin,
        marginVertical: spacing[2],
      }}
    >
      <SessionComparisonTable
        mode={props.target === 'workoutSession' ? 'compact' : 'full'}
        onPress={
          props.target === 'workoutSession'
            ? props.openPostWorkoutSummary
            : undefined
        }
        previousSession={previousComparableSession}
        session={session}
      />
    </View>
  );

  return (
    <FullHeightScrollView floatingChildren={floatingBottomContainer}>
      <DelayRender placeHolder={<Loader />}>
        {bodyWeight}
        {notesComponent}
        {emptyInfo}
        <ItemList items={session.recordedExercises} renderItem={renderItem} />
        {totalWeightLifted}
        <FullScreenDialog
          avoidKeyboard
          title={
            exerciseToEditIndex === undefined
              ? t('exercise.add.title')
              : t('exercise.edit.title')
          }
          action={
            exerciseToEditIndex === undefined
              ? t('generic.add.button')
              : t('generic.update.button')
          }
          open={exerciseEditorOpen}
          onAction={handleEditExercise}
          onClose={() => setExerciseEditorOpen(false)}
        >
          {editingExerciseBlueprint ? (
            <ExerciseEditor
              exercise={editingExerciseBlueprint}
              updateExercise={(ex) => {
                setEditingExerciseBlueprint(ex);
              }}
            />
          ) : null}
        </FullScreenDialog>
      </DelayRender>
    </FullHeightScrollView>
  );
}

function getSessionProgress(
  session: NonNullable<ReturnType<typeof selectCurrentSession>>,
) {
  return session.recordedExercises.reduce(
    (accum, exercise) => {
      if (exercise instanceof RecordedWeightedExercise) {
        accum.totalSets += exercise.potentialSets.length;
        accum.completedSets += exercise.potentialSets.filter(
          (set) => set.set !== undefined,
        ).length;
      } else if (exercise instanceof RecordedCardioExercise) {
        accum.totalSets += exercise.sets.length;
        accum.completedSets += exercise.sets.filter(
          (set) => set.isCompletelyFilled,
        ).length;
      }
      return accum;
    },
    { completedSets: 0, totalSets: 0 },
  );
}
