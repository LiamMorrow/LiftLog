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
import { T, useTranslate } from '@tolgee/react';
import ItemList from '@/components/presentation/foundation/item-list';
import TouchableRipple from '@/components/presentation/foundation/gesture-wrappers/touchable-ripple';
import {
  RecordedCardioExercise,
  RecordedExercise,
  RecordedWeightedExercise,
  Session,
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
import WeightFormat from '@/components/presentation/foundation/weight-format';
import { formatDuration } from '@/utils/format-date';
import { localeFormatBigNumber } from '@/utils/locale-bignumber';
import { match, P } from 'ts-pattern';
import { CardioExercise } from '@/components/presentation/workout/cardio/cardio-exercise';
import { DelayRender } from '../presentation/foundation/delay-render';
import { Loader } from '../presentation/foundation/loader';
import { NormalizedName } from '@/models/blueprint-models';
import { Weight } from '@/models/weight';

export default function SessionComponent(props: {
  target: SessionTarget;
  showBodyweight: boolean;
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
  const [isExerciseBreakdownOpen, setExerciseBreakdownOpen] = useState(false);
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
  const weightedExerciseComparisons = getWeightedExerciseComparisons(
    session,
    previousComparableSession,
  );
  const showCurrentTotalTime =
    !!session.duration && session.duration.toMinutes() >= 5;
  const showPreviousTotalTime =
    !!previousComparableSession?.duration &&
    previousComparableSession.duration.toMinutes() >= 5;
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
    <View
      style={{ marginHorizontal: spacing.pageHorizontalMargin }}
      testID="bodyweight-card"
    >
      <View
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
          updateWeight={(bodyweight) =>
            dispatch(updateBodyweight, { bodyweight })
          }
          increment={new BigNumber('0.1')}
          label={t('exercise.bodyweight.label')}
        />
      </View>
    </View>
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
      <TouchableRipple
        borderless
        onPress={
          props.target === 'workoutSession' &&
          weightedExerciseComparisons.length
            ? () => setExerciseBreakdownOpen((current) => !current)
            : undefined
        }
      >
        <View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderBottomWidth:
                showCurrentTotalTime || showPreviousTotalTime ? 1 : 0,
              borderBottomColor: colors.outlineVariant,
            }}
          >
            <View
              style={{
                flex: 1.46,
                paddingHorizontal: spacing[2],
                paddingVertical: spacing[2],
              }}
            />
            <Text
              variant="bodyMedium"
              style={{
                flex: 0.56,
                paddingHorizontal: spacing[2],
                paddingVertical: spacing[2],
                textAlign: 'right',
                color: colors.onSurfaceVariant,
              }}
            >
              {t('generic.previous.button')}
            </Text>
            <Text
              variant="bodyMedium"
              style={{
                flex: 0.56,
                paddingHorizontal: spacing[2],
                paddingVertical: spacing[2],
                textAlign: 'right',
                color: colors.onSurfaceVariant,
              }}
            >
              {t('workout.current_short.label')}
            </Text>
            <View
              style={{
                flex: 0.34,
                paddingHorizontal: spacing[2],
                paddingVertical: spacing[2],
              }}
            />
          </View>
          {showCurrentTotalTime || showPreviousTotalTime ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderBottomWidth: 1,
                borderBottomColor: colors.outlineVariant,
              }}
            >
              <Text
                variant="bodyMedium"
                style={{
                  flex: 1.46,
                  paddingHorizontal: spacing[2],
                  paddingVertical: spacing[2],
                }}
              >
                <T keyName="workout.total_time.label" />
              </Text>
              <Text
                variant="bodyMedium"
                style={{
                  flex: 0.56,
                  paddingHorizontal: spacing[2],
                  paddingVertical: spacing[2],
                  textAlign: 'right',
                  color: colors.primary,
                  fontWeight: 'normal',
                }}
              >
                {(showPreviousTotalTime &&
                  previousComparableSession?.duration &&
                  formatDuration(
                    previousComparableSession.duration,
                    'hours-mins',
                  )) ||
                  '-'}
              </Text>
              <Text
                variant="bodyMedium"
                style={{
                  flex: 0.56,
                  paddingHorizontal: spacing[2],
                  paddingVertical: spacing[2],
                  textAlign: 'right',
                  color: colors.primary,
                  fontWeight: 'bold',
                }}
              >
                {(showCurrentTotalTime &&
                  session.duration &&
                  formatDuration(session.duration, 'hours-mins')) ||
                  '-'}
              </Text>
              <View
                style={{
                  flex: 0.34,
                  paddingHorizontal: spacing[2],
                  paddingVertical: spacing[2],
                }}
              />
            </View>
          ) : null}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Text
              variant="bodyMedium"
              style={{
                flex: 1.46,
                paddingHorizontal: spacing[2],
                paddingVertical: spacing[2],
              }}
            >
              {t('stats.exercise.total_lifted.label')}
            </Text>
            <View
              style={{
                flex: 0.56,
                alignItems: 'flex-end',
                paddingHorizontal: spacing[2],
                paddingVertical: spacing[2],
              }}
            >
              {previousComparableSession ? (
                <WeightFormat
                  decimalPlaces={0}
                  fontWeight="normal"
                  color="primary"
                  weight={previousComparableSession.totalWeightLifted}
                />
              ) : (
                <Text variant="bodyMedium">-</Text>
              )}
            </View>
            <View
              style={{
                flex: 0.56,
                alignItems: 'flex-end',
                paddingHorizontal: spacing[2],
                paddingVertical: spacing[2],
              }}
            >
              <WeightFormat
                decimalPlaces={0}
                fontWeight="bold"
                color="primary"
                weight={session.totalWeightLifted}
              />
            </View>
            <View
              style={{
                flex: 0.34,
                alignItems: 'flex-end',
                paddingHorizontal: spacing[2],
                paddingVertical: spacing[2],
              }}
            >
              <ComparisonBadge
                current={session.totalWeightLifted}
                previous={previousComparableSession?.totalWeightLifted}
              />
            </View>
          </View>
        </View>
      </TouchableRipple>
      {props.target === 'workoutSession' &&
      isExerciseBreakdownOpen &&
      weightedExerciseComparisons.length ? (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.outlineVariant,
          }}
        >
          {weightedExerciseComparisons.map((comparison, index) => (
            <View
              key={comparison.key}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderBottomWidth:
                  index === weightedExerciseComparisons.length - 1 ? 0 : 1,
                borderBottomColor: colors.outlineVariant,
              }}
            >
              <Text
                variant="bodyMedium"
                style={{
                  flex: 1.46,
                  paddingHorizontal: spacing[2],
                  paddingVertical: spacing[2],
                }}
              >
                {comparison.name}
              </Text>
              <View
                style={{
                  flex: 0.56,
                  alignItems: 'flex-end',
                  paddingHorizontal: spacing[2],
                  paddingVertical: spacing[2],
                }}
              >
                {comparison.previous ? (
                  <WeightFormat
                    decimalPlaces={0}
                    fontWeight="normal"
                    color="primary"
                    weight={comparison.previous}
                  />
                ) : (
                  <Text variant="bodyMedium">-</Text>
                )}
              </View>
              <View
                style={{
                  flex: 0.56,
                  alignItems: 'flex-end',
                  paddingHorizontal: spacing[2],
                  paddingVertical: spacing[2],
                }}
              >
                <WeightFormat
                  decimalPlaces={0}
                  fontWeight="bold"
                  color="primary"
                  weight={comparison.current}
                />
              </View>
              <View
                style={{
                  flex: 0.34,
                  alignItems: 'flex-end',
                  paddingHorizontal: spacing[2],
                  paddingVertical: spacing[2],
                }}
              >
                <ComparisonBadge
                  current={comparison.current}
                  previous={comparison.previous}
                />
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );

  return (
    <FullHeightScrollView floatingChildren={floatingBottomContainer}>
      <DelayRender placeHolder={<Loader />}>
        {notesComponent}
        {emptyInfo}
        <ItemList items={session.recordedExercises} renderItem={renderItem} />
        {bodyWeight}
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

function getWeightedExerciseComparisons(
  session: Session,
  previousSession: Session | undefined,
) {
  const currentExerciseTotals = getWeightedExerciseTotals(session);
  const previousExerciseTotals = previousSession
    ? getWeightedExerciseTotals(previousSession)
    : new Map<string, { name: string; weight: Weight }>();

  return Array.from(currentExerciseTotals.entries()).map(([key, value]) => ({
    key,
    name: value.name,
    current: value.weight,
    previous: previousExerciseTotals.get(key)?.weight,
  }));
}

function getWeightedExerciseTotals(session: Session) {
  const totals = new Map<string, { name: string; weight: Weight }>();

  for (const exercise of session.recordedExercises) {
    if (!(exercise instanceof RecordedWeightedExercise)) {
      continue;
    }

    const key = NormalizedName.fromExerciseBlueprint(
      exercise.blueprint,
    ).toString();
    const existing = totals.get(key);
    totals.set(key, {
      name: existing?.name ?? exercise.blueprint.name,
      weight: (existing?.weight ?? Weight.NIL).plus(exercise.totalWeightLifted),
    });
  }

  return totals;
}

function getIncreasePercentage(
  current: Weight,
  previous: Weight | undefined,
): BigNumber | undefined {
  if (!previous || previous.value.lte(0) || !current.isGreaterThan(previous)) {
    return undefined;
  }

  return current
    .minus(previous)
    .value.multipliedBy(100)
    .dividedBy(previous.value);
}

function ComparisonBadge(props: {
  current: Weight;
  previous: Weight | undefined;
}) {
  const { colors } = useAppTheme();
  const increasePercentage = getIncreasePercentage(
    props.current,
    props.previous,
  );

  return (
    increasePercentage ? (
      <View
        style={{
          borderRadius: spacing[4],
          backgroundColor: colors.secondaryContainer,
          paddingHorizontal: spacing[2],
          paddingVertical: spacing[0.5],
        }}
      >
        <Text
          variant="labelSmall"
          style={{
            color: colors.onSecondaryContainer,
            fontWeight: '600',
            fontVariant: ['tabular-nums'],
          }}
        >
          +{localeFormatBigNumber(increasePercentage, 0)}%
        </Text>
      </View>
    ) : null
  );
}
