import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import { ExerciseEditor } from '@/components/presentation/workout-editor/exercise-editor';
import { ExerciseBlueprint } from '@/models/blueprint-models';
import { useAppSelector } from '@/store';
import { selectProgramSessionExercise, updateProgram } from '@/store/program';
import { useTranslate } from '@tolgee/react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

export default function ExercisePage() {
  const { t } = useTranslate();
  const { sessionIndex, programId, exerciseIndex } = useLocalSearchParams<{
    sessionIndex: string;
    programId: string;
    exerciseIndex: string;
  }>();
  const location = {
    programId,
    sessionIndex: Number(sessionIndex),
    exerciseIndex: Number(exerciseIndex),
  };
  const exercise = useAppSelector((x) => selectProgramSessionExercise(x, location));
  const dispatch = useDispatch();
  const { dismiss } = useRouter();
  const saveExercise = (exerciseToSave: ExerciseBlueprint) => {
    dispatch(
      updateProgram({
        programId: location.programId,
        update: (program) =>
          program.withSession(location.sessionIndex, (session) =>
            session.withExercise(location.exerciseIndex, exerciseToSave),
          ),
      }),
    );
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
