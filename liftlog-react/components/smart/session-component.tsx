import {
  addExercise,
  cycleExerciseReps,
  editExercise,
  notifySetTimer,
  removeExercise,
  selectRecentlyCompletedExercises,
  SessionTarget,
  setExerciseReps,
  toggleExercisePerSetWeight,
  updateBodyweight,
  updateExerciseWeight,
  updateNotesForExercise,
  updateWeightForSet,
} from '@/store/current-session';
import { Card, FAB, Icon } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { Text } from 'react-native';
import EmptyInfo from '@/components/presentation/empty-info';
import { useAppTheme, spacing, font } from '@/hooks/useAppTheme';
import { useTranslate } from '@tolgee/react';
import ItemList from '@/components/presentation/item-list';
import { RecordedExercise } from '@/models/session-models';
import WeightedExercise from '@/components/presentation/weighted-exercise';
import WeightDisplay from '@/components/presentation/weight-display';
import BigNumber from 'bignumber.js';
import RestTimer from '@/components/presentation/rest-timer';
import FloatingBottomContainer from '@/components/presentation/floating-bottom-container';
import { useState } from 'react';
import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import { ExerciseBlueprint } from '@/models/session-models';
import FullScreenDialog from '@/components/presentation/full-screen-dialog';
import { ExerciseEditor } from '@/components/presentation/exercise-editor';
import { LocalDateTime } from '@js-joda/core';
import { useSession } from '@/hooks/useSession';
import { useAppSelector } from '@/store';
import UpdatePlanButton from '@/components/smart/update-plan-button';
import { UnknownAction } from '@reduxjs/toolkit';

export default function SessionComponent(props: {
  target: SessionTarget;
  showBodyweight: boolean;
}) {
  const { colors } = useAppTheme();
  const { t } = useTranslate();
  const session = useSession(props.target);
  const storeDispatch = useDispatch();
  const dispatch = <T,>(
    reducer: (a: { payload: T; target: SessionTarget }) => UnknownAction,
    payload: T,
  ) => storeDispatch(reducer({ payload, target: props.target }));
  const recentlyCompletedExercises = useAppSelector(
    selectRecentlyCompletedExercises,
  );

  const perSetWeightSetting = useAppSelector(
    (x) => x.settings.splitWeightByDefault,
  );

  const isReadonly = props.target === 'feedSession';

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
        dispatch(editExercise, {
          exerciseIndex: exerciseToEditIndex,
          newBlueprint: editingExerciseBlueprint,
        });
        setExerciseToEditIndex(undefined);
      } else {
        dispatch(addExercise, {
          blueprint: editingExerciseBlueprint,
          perSetWeight: perSetWeightSetting,
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
        marginHorizontal: spacing[7],
      }}
    >
      <Card.Content
        style={{
          gap: spacing[4],
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Icon source="text" size={20} />
        <Text style={{ color: colors.onSurface }}>
          {session.blueprint.notes}
        </Text>
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
      togglePerSepWeight={() =>
        dispatch(toggleExercisePerSetWeight, {
          exerciseIndex: index,
        })
      }
      updateWeightForSet={(setIndex, weight) =>
        dispatch(updateWeightForSet, {
          exerciseIndex: index,
          weight,
          setIndex,
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
      onOpenLink={() => {}}
      isReadonly={isReadonly}
      showPreviousButton={props.target === 'workoutSession'}
      previousRecordedExercises={recentlyCompletedExercises(item.blueprint)}
    />
  );

  const bodyWeight = props.showBodyweight ? (
    <Card style={{ marginHorizontal: spacing[2] }} mode="contained">
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

  const lastExercise = session.lastExercise;
  const lastRecordedSet = lastExercise?.lastRecordedSet;
  const showSnackbar =
    props.target === 'workoutSession' &&
    session.nextExercise &&
    lastExercise &&
    lastRecordedSet?.set;
  const lastSetFailed =
    lastRecordedSet?.set &&
    lastExercise &&
    lastRecordedSet.set.repsCompleted < lastExercise.blueprint.repsPerSet;
  const snackbar = showSnackbar ? (
    <RestTimer
      rest={lastExercise.blueprint.restBetweenSets}
      startTime={lastRecordedSet.set.completionDateTime}
      failed={!!lastSetFailed}
    />
  ) : undefined;

  const floatingBottomContainer = isReadonly ? null : (
    <FloatingBottomContainer
      fab={
        <FAB
          variant="surface"
          size="small"
          icon="add"
          label={t('AddExercise')}
        />
      }
      additionalContent={snackbar}
    />
  );

  return (
    <FullHeightScrollView floatingChildren={floatingBottomContainer}>
      {notesComponent}
      {emptyInfo}
      <ItemList items={session.recordedExercises} renderItem={renderItem} />
      {bodyWeight}
      {updatePlanButton}
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
