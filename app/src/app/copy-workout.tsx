import { CopyWorkoutPicker } from '@/components/smart/copy-workout-picker';
import { useLocalSearchParams } from 'expo-router';

export default function CopyWorkoutPage() {
  const { programId, sessionIndex } = useLocalSearchParams<{ programId: string; sessionIndex: string }>();
  return <CopyWorkoutPicker programId={programId} sessionIndex={Number(sessionIndex)} />;
}
