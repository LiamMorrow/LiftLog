import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import { ExerciseEditor } from '@/components/presentation/workout-editor/exercise-editor';
import { ExerciseBlueprint } from '@/models/blueprint-models';
import { useAppSelector, useAppSelectorWithArg } from '@/store';
import { selectCurrentSession, SessionTarget, setCurrentSession } from '@/store/current-session';
import { useTranslate } from '@tolgee/react';
import { Href, Stack, useRouter } from 'expo-router';
import { HeaderHeightContext } from 'expo-router/react-navigation';
import { useContext, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useDispatch, useStore } from 'react-redux';

export function getSessionExerciseEditorHref(target: SessionTarget, index: number, opts?: { isNew?: boolean }): Href {
  return `/exercise-editor?target=${target}&index=${index}${opts?.isNew ? '&isNew=1' : ''}` as Href;
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
  const headerHeight = useContext(HeaderHeightContext); // Intentionally don't use useHeaderHeight as it might not be in a stack
  const topInsetHeight = Platform.select({ ios: headerHeight }) ?? 0;

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
    <FullHeightScrollView
      safeAreaEdges={{
        left: 'additive',
        right: 'additive',
        top: 'off',
        bottom: 'additive',
      }}
      avoidKeyboard
      contentContainerStyle={{ insetBlockStart: topInsetHeight }}
    >
      <Stack.Screen options={{ title }} />
      {exercise ? <ExerciseEditor exercise={exercise} updateExercise={saveExercise} /> : null}
    </FullHeightScrollView>
  );
}
