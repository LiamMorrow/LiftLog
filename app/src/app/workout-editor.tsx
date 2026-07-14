import { SessionWorkoutEditor } from '@/components/smart/session-workout-editor';
import { SessionTarget } from '@/store/current-session';
import { useLocalSearchParams } from 'expo-router';

export default function WorkoutEditorPage() {
  const { target } = useLocalSearchParams<{ target: SessionTarget }>();
  return <SessionWorkoutEditor target={target} />;
}
