import { SessionExerciseEditor } from '@/components/smart/session-exercise-editor';
import { useLocalSearchParams } from 'expo-router';

export default function SessionExerciseEditorPage() {
  const { index, isNew } = useLocalSearchParams<{ index: string; isNew?: string }>();
  return <SessionExerciseEditor target="workoutSession" index={Number(index)} isNew={!!isNew} />;
}
