import { SessionWorkoutEditor } from '@/components/smart/session-workout-editor';
import { useLocalSearchParams } from 'expo-router';

export default function WorkoutEditorPage() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  return <SessionWorkoutEditor sessionId={sessionId} />;
}
