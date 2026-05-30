import {
  selectCurrentSession,
  SessionTarget,
  setCurrentSession,
} from '@/store/current-session';
import { useDispatch } from 'react-redux';
import { useTranslate } from '@tolgee/react';
import { useEffect, useState } from 'react';
import {
  EmptyExerciseBlueprint,
  ExerciseBlueprint,
} from '@/models/blueprint-models';
import FullScreenDialog from '@/components/presentation/foundation/full-screen-dialog';
import { ExerciseEditor } from '@/components/presentation/workout-editor/exercise-editor';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import { Appbar, Menu, TextInput, Tooltip } from 'react-native-paper';
import { Platform, View } from 'react-native';
import { spacing } from '@/hooks/useAppTheme';
import { Stack } from 'expo-router';
import { Jiggler } from '@/components/presentation/foundation/jiggler';
import IconButton from '@/components/presentation/foundation/gesture-wrappers/icon-button';

export default function SessionMoreMenuComponent(props: {
  target: SessionTarget;
  save: () => void;
}) {
  const { t } = useTranslate();
  const { save } = props;
  const useImperialUnits = useAppSelector((x) => x.settings.useImperialUnits);
  const session = useAppSelectorWithArg(selectCurrentSession, props.target);
  const dispatch = useDispatch();

  const isReadonly = props.target === 'feedSession';
  const [editingExerciseBlueprint, setEditingExerciseBlueprint] = useState<
    ExerciseBlueprint | undefined
  >(undefined);
  const [exerciseEditorOpen, setExerciseEditorOpen] = useState(false);
  const [workoutEditorOpen, setWorkoutEditorOpen] = useState(false);

  const handleAddExercise = () => {
    if (editingExerciseBlueprint !== undefined) {
      dispatch(
        setCurrentSession({
          session: session?.withAddedExercise(
            editingExerciseBlueprint,
            useImperialUnits,
          ),
          target: props.target,
        }),
      );
    }
    setExerciseEditorOpen(false);
  };

  if (!session || isReadonly) {
    return <></>;
  }

  return (
    <>
      {Platform.select({
        ios: (
          <IosMenu
            target={props.target}
            save={save}
            setEditingExerciseBlueprint={setEditingExerciseBlueprint}
            setExerciseEditorOpen={setExerciseEditorOpen}
            setWorkoutEditorOpen={setWorkoutEditorOpen}
          />
        ),
        android: (
          <Stack.Screen
            options={{
              headerRight: () => (
                <AndroidMenu
                  target={props.target}
                  save={save}
                  setEditingExerciseBlueprint={setEditingExerciseBlueprint}
                  setExerciseEditorOpen={setExerciseEditorOpen}
                  setWorkoutEditorOpen={setWorkoutEditorOpen}
                />
              ),
            }}
          />
        ),
      })}
      <FullScreenDialog
        title={t('exercise.add.title')}
        action={t('generic.add.button')}
        open={exerciseEditorOpen}
        onAction={handleAddExercise}
        avoidKeyboard
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

function IosMenu(props: {
  target: SessionTarget;
  save: () => void;
  setWorkoutEditorOpen: (o: boolean) => void;
  setExerciseEditorOpen: (o: boolean) => void;
  setEditingExerciseBlueprint: (o: ExerciseBlueprint) => void;
}) {
  const { t } = useTranslate();
  const {
    target,
    save,
    setEditingExerciseBlueprint,
    setExerciseEditorOpen,
    setWorkoutEditorOpen,
  } = props;
  const finishText =
    target === 'workoutSession'
      ? t('generic.finish.button')
      : t('generic.save.button');
  return (
    <Stack.Toolbar placement="right">
      <Stack.Toolbar.Button onPress={save}>
        <Stack.Toolbar.Label>{finishText}</Stack.Toolbar.Label>
      </Stack.Toolbar.Button>
      <Stack.Toolbar.Menu>
        <Stack.Toolbar.Icon sf="ellipsis.circle" />
        <Stack.Toolbar.MenuAction
          onPress={() => {
            setExerciseEditorOpen(true);
            setEditingExerciseBlueprint(
              EmptyExerciseBlueprint.with({ name: 'New Exercise' }),
            );
          }}
          icon={'plus'}
        >
          {t('exercise.add.title')}
        </Stack.Toolbar.MenuAction>
        <Stack.Toolbar.MenuAction
          onPress={() => {
            setWorkoutEditorOpen(true);
          }}
          icon={'pencil'}
        >
          {t('workout.edit.button')}
        </Stack.Toolbar.MenuAction>
      </Stack.Toolbar.Menu>
    </Stack.Toolbar>
  );
}

function AndroidMenu(props: {
  target: SessionTarget;
  save: () => void;
  setWorkoutEditorOpen: (o: boolean) => void;
  setExerciseEditorOpen: (o: boolean) => void;
  setEditingExerciseBlueprint: (o: ExerciseBlueprint) => void;
}) {
  const { t } = useTranslate();
  const {
    target,
    save,
    setEditingExerciseBlueprint,
    setExerciseEditorOpen,
    setWorkoutEditorOpen,
  } = props;
  const session = useAppSelectorWithArg(selectCurrentSession, target);

  const [menuOpen, setMenuOpen] = useState(false);
  const [jiggleFinishButton, setJiggleFinishButton] = useState(false);
  const isComplete = session?.isComplete;

  useEffect(() => {
    const shouldJiggle = isComplete === true;
    setJiggleFinishButton(shouldJiggle);
    if (shouldJiggle) {
      const timeout = setTimeout(() => setJiggleFinishButton(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [isComplete]);
  return (
    <>
      <Jiggler jiggling={jiggleFinishButton} jiggleSpeed={140}>
        <Tooltip title={t('workout.finish.action.tooltip')}>
          <IconButton icon={'assignmentTurnedIn'} onPress={save} />
        </Tooltip>
      </Jiggler>
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
            setEditingExerciseBlueprint(
              EmptyExerciseBlueprint.with({ name: 'New Exercise' }),
            );
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
  // When the store updates we need to replace our one
  useEffect(() => {
    setEditorWorkout(workout);
  }, [workout]);

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
