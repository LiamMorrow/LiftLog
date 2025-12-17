import {
  addExercise,
  selectCurrentSession,
  SessionTarget,
  setCurrentSession,
} from '@/store/current-session';
import { useDispatch } from 'react-redux';
import { useTranslate } from '@tolgee/react';
import { useState } from 'react';
import { ExerciseBlueprint } from '@/models/blueprint-models';
import { EmptyExerciseBlueprint } from '@/models/blueprint-models';
import FullScreenDialog from '@/components/presentation/full-screen-dialog';
import { ExerciseEditor } from '@/components/presentation/exercise-editor';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import { UnknownAction } from '@reduxjs/toolkit';
import { Appbar, Menu, TextInput } from 'react-native-paper';
import { View } from 'react-native';
import { spacing } from '@/hooks/useAppTheme';

export default function SessionMoreMenuComponent(props: {
  target: SessionTarget;
}) {
  const { t } = useTranslate();
  const useImperialUnits = useAppSelector((x) => x.settings.useImperialUnits);
  const session = useAppSelectorWithArg(selectCurrentSession, props.target);
  const storeDispatch = useDispatch();
  const dispatch = <T,>(
    reducer: (a: { payload: T; target: SessionTarget }) => UnknownAction,
    payload: T,
  ) => storeDispatch(reducer({ payload, target: props.target }));
  const [menuOpen, setMenuOpen] = useState(false);

  const isReadonly = props.target === 'feedSession';
  const [editingExerciseBlueprint, setEditingExerciseBlueprint] = useState<
    ExerciseBlueprint | undefined
  >(undefined);
  const [exerciseEditorOpen, setExerciseEditorOpen] = useState(false);
  const [workoutEditorOpen, setWorkoutEditorOpen] = useState(false);

  const handleAddExercise = () => {
    if (editingExerciseBlueprint !== undefined) {
      dispatch(addExercise, {
        blueprint: editingExerciseBlueprint,
        useImperialUnits,
      });
      setExerciseEditorOpen(false);
    }
  };

  if (!session || isReadonly) {
    return <></>;
  }

  return (
    <>
      <Menu
        anchorPosition="bottom"
        onDismiss={() => setMenuOpen(false)}
        anchor={
          <Appbar.Action
            testID="session-more"
            icon="moreVert"
            onPress={() => setMenuOpen(true)}
          />
        }
        visible={menuOpen}
      >
        <Menu.Item
          onPress={() => {
            setExerciseEditorOpen(true);
            setEditingExerciseBlueprint(EmptyExerciseBlueprint);
            setMenuOpen(false);
          }}
          testID="session-add-exercise"
          leadingIcon={'add'}
          title={t('exercise.add.title')}
        />
        <Menu.Item
          onPress={() => {
            setWorkoutEditorOpen(true);
            setMenuOpen(false);
          }}
          testID="session-edit"
          leadingIcon={'edit'}
          title={t('workout.edit.button')}
        />
      </Menu>
      <FullScreenDialog
        title={t('exercise.add.title')}
        action={t('generic.add.button')}
        open={exerciseEditorOpen}
        onAction={handleAddExercise}
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
      <WorkoutEditor
        open={workoutEditorOpen}
        setOpen={setWorkoutEditorOpen}
        target={props.target}
      />
    </>
  );
}

function WorkoutEditor(props: {
  target: SessionTarget;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { t } = useTranslate();
  const { open, setOpen, target } = props;
  const workout = useAppSelectorWithArg(selectCurrentSession, props.target);
  const dispatch = useDispatch();
  const [editorWorkout, setEditorWorkout] = useState(workout);

  const handleSaveWorkout = () => {
    dispatch(setCurrentSession({ session: editorWorkout, target }));
    setOpen(false);
  };
  if (!editorWorkout) {
    return <></>;
  }

  return (
    <FullScreenDialog
      title={t('workout.edit.button')}
      action={t('generic.save.button')}
      open={open}
      onAction={handleSaveWorkout}
      onClose={() => {
        setOpen(false);
        setEditorWorkout(workout);
      }}
    >
      <View style={{ gap: spacing[2] }}>
        <TextInput
          label={t('workout.name.label')}
          testID="workout-name"
          style={{ marginBottom: spacing[2] }}
          value={editorWorkout.blueprint.name}
          onChangeText={(name) =>
            setEditorWorkout(
              editorWorkout.with({
                blueprint: editorWorkout.blueprint.with({ name }),
              }),
            )
          }
        />
        <TextInput
          label={t('plan.notes.label')}
          testID="workout-notes"
          style={{ marginBottom: spacing[2] }}
          defaultValue={editorWorkout.blueprint.notes}
          onChangeText={(notes) =>
            setEditorWorkout(
              editorWorkout.with({
                blueprint: editorWorkout.blueprint.with({ notes }),
              }),
            )
          }
          multiline
        />
      </View>
    </FullScreenDialog>
  );
}
