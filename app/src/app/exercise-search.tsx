import { ExerciseSearch } from '@/components/smart/exercise-search';
import { useLocalSearchParams } from 'expo-router';

export default function ExerciseSearchPage() {
  const { requestId, exerciseName } = useLocalSearchParams<{ requestId: string; exerciseName?: string }>();
  return <ExerciseSearch requestId={requestId} exerciseName={exerciseName ?? ''} />;
}
