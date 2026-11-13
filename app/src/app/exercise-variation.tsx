import { ExerciseVariationPicker } from '@/components/exercises/exercise-variation-picker';
import { ExerciseDescriptor } from '@/models/exercise-models';
import { useLocalSearchParams } from 'expo-router';

export function ExerciseVariationPage() {
  const { requestId, exercise } = useLocalSearchParams<{ requestId: string; exercise: string }>();
  return <ExerciseVariationPicker requestId={requestId} exercise={JSON.parse(exercise) as ExerciseDescriptor} />;
}

export default ExerciseVariationPage;
