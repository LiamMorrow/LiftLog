import { CopyExercisePicker } from '@/components/smart/copy-exercise-picker';
import { useLocalSearchParams } from 'expo-router';

export default function CopyExercisePage() {
  const { programId, sessionIndex, exerciseIndex } = useLocalSearchParams<{
    programId: string;
    sessionIndex: string;
    exerciseIndex: string;
  }>();
  return (
    <CopyExercisePicker
      programId={programId}
      sessionIndex={Number(sessionIndex)}
      exerciseIndex={Number(exerciseIndex)}
    />
  );
}
