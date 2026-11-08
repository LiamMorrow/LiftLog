import ExerciseManager from '@/components/exercises/exercise-manager';
import { useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';

export default function ExerciseManagerPage() {
  const { t } = useTranslate();
  return (
    <>
      <Stack.Screen options={{ title: t('exercise.manage.title') }} />
      <ExerciseManager />
    </>
  );
}
