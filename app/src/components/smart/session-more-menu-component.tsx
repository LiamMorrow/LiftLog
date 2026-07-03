import { selectCurrentSession, SessionTarget, setCurrentSession } from '@/store/current-session';
import { useDispatch } from 'react-redux';
import { useTranslate } from '@tolgee/react';
import { useEffect, useState } from 'react';
import { EmptyExerciseBlueprint } from '@/models/blueprint-models';
import { getSessionExerciseEditorHref } from '@/components/smart/session-exercise-editor';
import { getSessionWorkoutEditorHref } from '@/components/smart/session-workout-editor';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import { Appbar, Menu, Tooltip } from 'react-native-paper';
import { Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Jiggler } from '@/components/presentation/foundation/jiggler';
import IconButton from '@/components/presentation/foundation/gesture-wrappers/icon-button';

export default function SessionMoreMenuComponent(props: { target: SessionTarget; save: () => void }) {
  const { save } = props;
  const useImperialUnits = useAppSelector((x) => x.settings.useImperialUnits);
  const session = useAppSelectorWithArg(selectCurrentSession, props.target);
  const dispatch = useDispatch();
  const { push } = useRouter();

  const isReadonly = props.target === 'feedSession';

  const handleEditWorkout = () => {
    push(getSessionWorkoutEditorHref(props.target));
  };

  const handleAddExercise = () => {
    if (!session) {
      return;
    }
    const newIndex = session.recordedExercises.length;
    dispatch(
      setCurrentSession({
        session: session.withAddedExercise(EmptyExerciseBlueprint.with({ name: 'New Exercise' }), useImperialUnits),
        target: props.target,
      }),
    );
    push(getSessionExerciseEditorHref(props.target, newIndex, { isNew: true }));
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
            onAddExercise={handleAddExercise}
            onEditWorkout={handleEditWorkout}
          />
        ),
        android: (
          <Stack.Screen
            options={{
              headerRight: () => (
                <AndroidMenu
                  target={props.target}
                  save={save}
                  onAddExercise={handleAddExercise}
                  onEditWorkout={handleEditWorkout}
                />
              ),
            }}
          />
        ),
      })}
    </>
  );
}

function IosMenu(props: {
  target: SessionTarget;
  save: () => void;
  onEditWorkout: () => void;
  onAddExercise: () => void;
}) {
  const { t } = useTranslate();
  const { target, save, onAddExercise, onEditWorkout } = props;
  const finishText = target === 'workoutSession' ? t('generic.finish.button') : t('generic.save.button');
  return (
    <Stack.Toolbar placement="right">
      <Stack.Toolbar.Button onPress={save}>
        <Stack.Toolbar.Label>{finishText}</Stack.Toolbar.Label>
      </Stack.Toolbar.Button>
      <Stack.Toolbar.Menu>
        <Stack.Toolbar.Icon sf="ellipsis.circle" />
        <Stack.Toolbar.MenuAction onPress={onAddExercise} icon={'plus'}>
          {t('exercise.add.title')}
        </Stack.Toolbar.MenuAction>
        <Stack.Toolbar.MenuAction onPress={onEditWorkout} icon={'pencil'}>
          {t('workout.edit.button')}
        </Stack.Toolbar.MenuAction>
      </Stack.Toolbar.Menu>
    </Stack.Toolbar>
  );
}

function AndroidMenu(props: {
  target: SessionTarget;
  save: () => void;
  onEditWorkout: () => void;
  onAddExercise: () => void;
}) {
  const { t } = useTranslate();
  const { target, save, onAddExercise, onEditWorkout } = props;
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
          <IconButton testID="finish-session-button" icon={'assignmentTurnedIn'} onPress={save} />
        </Tooltip>
      </Jiggler>
      <Menu
        anchorPosition="bottom"
        onDismiss={() => setMenuOpen(false)}
        anchor={<Appbar.Action testID="session-more" icon="moreVert" onPress={() => setMenuOpen(true)} />}
        visible={menuOpen}
      >
        <Menu.Item
          onPress={() => {
            onAddExercise();
            setMenuOpen(false);
          }}
          testID="session-add-exercise"
          leadingIcon={'add'}
          title={t('exercise.add.title')}
        />
        <Menu.Item
          onPress={() => {
            onEditWorkout();
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
