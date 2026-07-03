import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import { ExerciseEditor } from '@/components/presentation/workout-editor/exercise-editor';
import { ExerciseBlueprint } from '@/models/blueprint-models';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import { selectCurrentSession, SessionTarget, setCurrentSession } from '@/store/current-session';
import { useTranslate } from '@tolgee/react';
import { Href, Stack, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useDispatch, useStore } from 'react-redux';

export function getSessionExerciseEditorHref(target: SessionTarget, index: number, opts?: { isNew?: boolean }): Href {
  const base = target === 'historySession' ? '/history/exercise-editor' : '/session/exercise-editor';
  return `${base}?index=${index}${opts?.isNew ? '&isNew=1' : ''}` as Href;
}

export function SessionExerciseEditor(props: { target: SessionTarget; index: number; isNew?: boolean }) {
  const { t } = useTranslate();
  const exerciseIndex = props.index;
  const isNew = props.isNew;
  const useImperialUnits = useAppSelector((x) => x.settings.useImperialUnits);
  const session = useAppSelectorWithArg(selectCurrentSession, props.target);
  const dispatch = useDispatch();
  const { getState } = useStore();
  const { dismiss } = useRouter();

  const exercise = session?.recordedExercises[exerciseIndex]?.blueprint;

  const title = isNew ? t('exercise.add.title') : t('exercise.edit.title');

  // Hold the edited exercise locally and only apply it to the session when the route is dismissed
  const draftRef = useRef<ExerciseBlueprint | undefined>(undefined);
  const saveExercise = (updated: ExerciseBlueprint) => {
    draftRef.current = updated;
  };

  const commitRef = useRef(() => {});
  commitRef.current = () => {
    const updated = draftRef.current;
    if (!updated) {
      return;
    }
    const latestSession = selectCurrentSession(getState(), props.target);
    if (latestSession?.recordedExercises[exerciseIndex]) {
      dispatch(
        setCurrentSession({
          session: latestSession.withEditedExercise(exerciseIndex, updated, useImperialUnits),
          target: props.target,
        }),
      );
    }
  };
  useEffect(() => () => commitRef.current(), []);

  const hasExercise = !!exercise;
  useEffect(() => {
    if (!hasExercise) {
      dismiss();
    }
  }, [hasExercise, dismiss]);

  return (
    <FullHeightScrollView avoidKeyboard>
      <Stack.Screen options={{ title }} />
      {exercise ? <ExerciseEditor exercise={exercise} updateExercise={saveExercise} /> : null}
    </FullHeightScrollView>
  );
}
