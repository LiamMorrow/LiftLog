import { ExerciseHistory } from '@/components/smart/exercise-history';
import { ExerciseBlueprint, movementKeyFor } from '@/models/blueprint-models';
import { useLocalSearchParams } from 'expo-router';

export default function ExerciseHistoryPage() {
  const { name, type } = useLocalSearchParams<{
    name: string;
    type: ExerciseBlueprint['type'];
  }>();
  return <ExerciseHistory exerciseName={name} movementKey={movementKeyFor(name, type)} />;
}
