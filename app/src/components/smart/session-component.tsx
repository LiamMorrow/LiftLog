import {
  selectCurrentSession,
  SessionTarget,
  setCurrentSession,
} from '@/store/current-session';
import { Card, FAB, Icon, Text } from 'react-native-paper';
import { useDispatch, useStore } from 'react-redux';
import { View } from 'react-native';
import EmptyInfo from '@/components/presentation/foundation/empty-info';
import { useAppTheme, spacing, font } from '@/hooks/useAppTheme';
import { T, useTranslate } from '@tolgee/react';
import ItemList from '@/components/presentation/foundation/item-list';
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
import { selectRecentlyCompletedExercises } from '@/store/stored-sessions';
import FloatingBottomContainer from '@/components/presentation/foundation/floating-bottom-container';
import { SurfaceText } from '@/components/presentation/foundation/surface-text';
import { match, P } from 'ts-pattern';
import { CardioExercise } from '@/components/presentation/workout/cardio/cardio-exercise';
import { DelayRender } from '../presentation/foundation/delay-render';
import { Loader } from '../presentation/foundation/loader';
import WeightFormat from '../presentation/foundation/weight-format';
import { formatDuration } from '@/utils/format-date';

export default function SessionComponent(props: {
  target: SessionTarget;
  showBodyweight: boolean;
  openPostWorkoutSummary?: () => void;
  saveAndClose?: () => void;
}) {
  const { colors } = useAppTheme();
  const useImperialUnits = useAppSelector((x) => x.settings.useImperialUnits);
  const { t } = useTranslate();
  const { getState } = useStore();
  const session = useAppSelectorWithArg(selectCurrentSession, props.target);
  const dispatch = useDispatch();
  const recentlyCompletedExercises = useAppSelectorWithArg(
    selectRecentlyCompletedExercises,
    10,
  );
  const resetTimer = (time: OffsetDateTime | undefined) => {
    updateSession((s) => s.with({ restTimerStartTime: time }));
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

  const isReadonly =
    props.target === 'feedSession' || props.target === 'sharedSession';

  const [exerciseToEditIndex, setExerciseToEditIndex] = useState<
    number | undefined
  >(undefined);
  const [editingExerciseBlueprint, setEditingExerciseBlueprint] = useState<
    ExerciseBlueprint | undefined
  >(undefined);
  const [exerciseEditorOpen, setExerciseEditorOpen] = useState(false);

  const handleEditExercise = () => {
    if (editingExerciseBlueprint !== undefined) {
      if (exerciseToEditIndex !== undefined) {
        updateSession((s) =>
          s.withEditedExercise(
            exerciseToEditIndex,
            editingExerciseBlueprint,
            useImperialUnits,
          ),
        );
        setExerciseToEditIndex(undefined);
      } else {
        updateSession((s) =>
          s.withAddedExercise(editingExerciseBlueprint, useImperialUnits),
        );
      }
      setExerciseEditorOpen(false);
    }
  };

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
                session.date
                  .atTime(LocalTime.now())
                  .atZone(ZoneId.systemDefault())
                  .toOffsetDateTime())
          }
          resetSetTimer={() =>
            withLatestSession((s) => resetTimer(s.lastExercise?.latestTime))
          }
          recordedExercise={item}
          toStartNext={session.nextExercise === item}
          updateExercise={(ex) =>
            updateSession((s) => s.withExercise(index, ex))
          }
          onEditExercise={() => {
            setEditingExerciseBlueprint(item.blueprint);
            setExerciseToEditIndex(index);
            setExerciseEditorOpen(true);
          }}
          onRemoveExercise={() =>
            updateSession((s) => s.withRemovedExercise(index))
          }
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
          updateExercise={(ex) =>
            updateSession((s) => s.withExercise(index, ex))
          }
          toStartNext={session.nextExercise === item}
          onEditExercise={() => {
            setEditingExerciseBlueprint(item.blueprint);
            setExerciseToEditIndex(index);
            setExerciseEditorOpen(true);
          }}
          onRemoveExercise={() =>
            updateSession((s) => s.withRemovedExercise(index))
          }
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

  const bodyweight = props.showBodyweight ? (
    <Card
      style={{ marginHorizontal: spacing.pageHorizontalMargin }}
      mode="contained"
      testID="bodyweight-card"
    >
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
          updateWeight={(bodyweight) =>
            updateSession((s) => s.with({ bodyweight }))
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
    session.restTimerStartTime;
  const lastSetFailed =
    lastRecordedSet?.set &&
    lastExercise &&
    lastExercise instanceof RecordedWeightedExercise &&
    lastRecordedSet.set.repsCompleted < lastExercise.blueprint.repsPerSet;
  const restTimer = showRestTimer ? (
    <View style={{ flex: 1 }}>
      <RestTimer
        rest={lastExercise.blueprint.restBetweenSets}
        startTime={session.restTimerStartTime}
        failed={!!lastSetFailed}
        resetTimer={() => resetTimer(OffsetDateTime.now())}
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

  const floatingBottomContainer = isReadonly ? null : (
    <FloatingBottomContainer
      additionalContent={
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View style={{ flex: 1 }}></View>
          {restTimer}
          {saveButton}
        </View>
      }
    />
  );

  const workoutSummary = (
    <Card
      mode="contained"
      onPress={
        props.target === 'workoutSession'
          ? props.openPostWorkoutSummary
          : undefined
      }
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
          <WeightFormat
            fontWeight="bold"
            color="primary"
            weight={session.totalWeightLifted}
          />
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
          <Text
            variant="bodyMedium"
            style={{ color: colors.primary, fontWeight: 'bold' }}
          >
            {(session.duration &&
              formatDuration(session.duration, 'hours-mins')) ||
              '-'}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <FullHeightScrollView floatingChildren={floatingBottomContainer}>
      <DelayRender placeHolder={<Loader />}>
        {notesComponent}
        {emptyInfo}
        <ItemList items={session.recordedExercises} renderItem={renderItem} />
        {bodyweight}
        {workoutSummary}
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
