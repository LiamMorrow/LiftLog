import { SessionExerciseEditor } from '@/components/workout/session-exercise-editor';
import { useLocalSearchParams } from 'expo-router';

export default function ExerciseEditorPage() {
  const { sessionId, index, isNew } = useLocalSearchParams<{
    sessionId: string;
    index: string;
    isNew?: string;
  }>();
  return <SessionExerciseEditor sessionId={sessionId} index={Number(index)} isNew={!!isNew} />;
}
