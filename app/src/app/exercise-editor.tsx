import { SessionExerciseEditor } from '@/components/smart/session-exercise-editor';
import { SessionTarget } from '@/store/current-session';
import { useLocalSearchParams } from 'expo-router';

export default function ExerciseEditorPage() {
  const { target, index, isNew } = useLocalSearchParams<{
    target: SessionTarget;
    index: string;
    isNew?: string;
  }>();
  return <SessionExerciseEditor target={target} index={Number(index)} isNew={!!isNew} />;
}
