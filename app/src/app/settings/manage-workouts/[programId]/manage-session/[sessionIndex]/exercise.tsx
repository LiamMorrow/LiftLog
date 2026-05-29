import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import { ExerciseEditor } from '@/components/presentation/workout-editor/exercise-editor';
import { ExerciseBlueprint } from '@/models/blueprint-models';
import { useAppSelector } from '@/store';
import {
  addExercise,
  selectEditingExercise,
  setEditingExerciseIndex,
  updateSessionExercise,
} from '@/store/session-editor';
import { useTranslate } from '@tolgee/react';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

export default function ExercisePage() {
  const { t } = useTranslate();
  const exercise = useAppSelector(selectEditingExercise);
  const dispatch = useDispatch();
  const { dismiss } = useRouter();
  const exerciseIndex = useAppSelector(
    (x) => x.sessionEditor.editingExerciseIndex,
  );
  const exerciseCount = useAppSelector(
    (x) => x.sessionEditor.sessionBlueprint?.exercises?.length ?? 0,
  );
  const saveExercise = (exerciseToSave: ExerciseBlueprint) => {
    if (!exerciseToSave) {
      return;
    }
    if (exerciseIndex !== undefined) {
      dispatch(
        updateSessionExercise({
          index: exerciseIndex,
          exercise: exerciseToSave,
        }),
      );
    } else {
      dispatch(addExercise(exerciseToSave));
      dispatch(setEditingExerciseIndex(exerciseCount));
    }
  };
  const hasExercise = !!exercise;
  useEffect(() => {
    if (!hasExercise) {
      dismiss();
    }
  }, [hasExercise, dismiss]);
  if (!exercise) {
    return;
  }

  return (
    <FullHeightScrollView avoidKeyboard>
      <ExerciseEditor
        exercise={exercise}
        updateExercise={(ex) => {
          saveExercise(ex);
        }}
      />
      <Stack.Screen options={{ title: t('exercise.edit.title') }} />
    </FullHeightScrollView>
  );
}
