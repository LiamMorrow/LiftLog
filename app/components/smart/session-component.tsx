import {
  addExercise,
  cycleExerciseReps,
  editExercise,
  notifySetTimer,
  removeExercise,
  selectCurrentSession,
  SessionTarget,
  setExerciseReps,
  setWorkoutSessionLastSetTime,
  updateBodyweight,
  updateExerciseWeight,
  updateNotesForExercise,
  updateWeightForSet,
} from '@/store/current-session';
import { Card, FAB, Icon } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { Linking, Text, View } from 'react-native';
import EmptyInfo from '@/components/presentation/empty-info';
import { useAppTheme, spacing, font } from '@/hooks/useAppTheme';
import { useTranslate } from '@tolgee/react';
import ItemList from '@/components/presentation/item-list';
import { RecordedExercise } from '@/models/session-models';
import WeightedExercise from '@/components/presentation/weighted-exercise';
import WeightDisplay from '@/components/presentation/weight-display';
import BigNumber from 'bignumber.js';
import RestTimer from '@/components/presentation/rest-timer';
import { useState } from 'react';
import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import { ExerciseBlueprint } from '@/models/session-models';
import FullScreenDialog from '@/components/presentation/full-screen-dialog';
import { ExerciseEditor } from '@/components/presentation/exercise-editor';
import { LocalDateTime } from '@js-joda/core';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import UpdatePlanButton from '@/components/smart/update-plan-button';
import { UnknownAction } from '@reduxjs/toolkit';

import { selectRecentlyCompletedExercises } from '@/store/stored-sessions';
import FloatingBottomContainer from '@/components/presentation/floating-bottom-container';
import { SurfaceText } from '@/components/presentation/surface-text';

export default function SessionComponent(props: {
  target: SessionTarget;
  showBodyweight: boolean;
  saveAndClose?: () => void;
}) {
  const { colors } = useAppTheme();
  const { t } = useTranslate();
  const lastSetTime = useAppSelector(
    (s) => s.currentSession.workoutSessionLastSetTime,
  );
  const session = useAppSelectorWithArg(selectCurrentSession, props.target);
  const storeDispatch = useDispatch();
  const dispatch = <T,>(
    reducer: (a: { payload: T; target: SessionTarget }) => UnknownAction,
    payload: T,
  ) => storeDispatch(reducer({ payload, target: props.target }));
  const recentlyCompletedExercises = useAppSelectorWithArg(
    selectRecentlyCompletedExercises,
    10,
  );
  const resetTimer = () => {
    storeDispatch(setWorkoutSessionLastSetTime(LocalDateTime.now()));
    storeDispatch(notifySetTimer());
  };

  const isReadonly = props.target === 'feedSession';

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
        });
        setExerciseToEditIndex(undefined);
      } else {
        dispatch(addExercise, {
          blueprint: editingExerciseBlueprint,
        });
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
        {t('SessionContainsNoExercises')}
      </EmptyInfo>
    ) : null;

  const renderItem = (item: RecordedExercise, index: number) => (
    <WeightedExercise
      recordedExercise={item}
      toStartNext={session.nextExercise === item}
      updateRepCountForSet={(setIndex, reps) => {
        dispatch(setExerciseReps, {
          exerciseIndex: index,
          reps,
          setIndex,
          time: LocalDateTime.now(),
        });
        if (props.target === 'workoutSession') storeDispatch(notifySetTimer());
      }}
      cycleRepCountForSet={(setIndex) => {
        dispatch(cycleExerciseReps, {
          exerciseIndex: index,
          setIndex,
          time: LocalDateTime.now(),
        });
        if (props.target === 'workoutSession') storeDispatch(notifySetTimer());
      }}
      updateWeightForExercise={(weight) =>
        dispatch(updateExerciseWeight, {
          exerciseIndex: index,
          weight,
        })
      }
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
      previousRecordedExercises={recentlyCompletedExercises(item.blueprint)}
    />
  );

  const bodyWeight = props.showBodyweight ? (
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
          {t('Bodyweight')}
        </Text>
        <WeightDisplay
          allowNull={true}
          weight={session.bodyweight}
          updateWeight={(bodyweight) =>
            dispatch(updateBodyweight, { bodyweight })
          }
          increment={new BigNumber('0.1')}
          label={t('Bodyweight')}
        />
      </Card.Content>
    </Card>
  ) : null;

  const updatePlanButton = isReadonly ? null : (
    <UpdatePlanButton target={props.target} session={session} />
  );
  const additionalActionsButtons = (
    <View style={{ flex: 1 }}>{updatePlanButton}</View>
  );

  const lastExercise = session.lastExercise;
  const lastRecordedSet = lastExercise?.lastRecordedSet;
  const showRestTimer =
    props.target === 'workoutSession' &&
    session.nextExercise &&
    lastExercise &&
    lastSetTime;
  const lastSetFailed =
    lastRecordedSet?.set &&
    lastExercise &&
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
        label={props.target === 'workoutSession' ? t('Finish') : t('Save')}
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
          {additionalActionsButtons}
          {restTimer}
          {saveButton}
        </View>
      }
    />
  );

  return (
    <FullHeightScrollView floatingChildren={floatingBottomContainer}>
      {notesComponent}
      {emptyInfo}
      <ItemList items={session.recordedExercises} renderItem={renderItem} />
      {bodyWeight}
      <FullScreenDialog
        title={
          exerciseToEditIndex === undefined
            ? t('AddExercise')
            : t('EditExercise')
        }
        action={exerciseToEditIndex === undefined ? t('Add') : t('Update')}
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
    </FullHeightScrollView>
  );
}
