import ExercisePicker from '@/components/presentation/exercise-picker';
import { useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';

export default function ExerciseManager() {
  const { t } = useTranslate();
  return (
    <>
      <Stack.Screen options={{ title: t('Exercise Manager') }} />
      <ExercisePicker />
    </>
  );
}
