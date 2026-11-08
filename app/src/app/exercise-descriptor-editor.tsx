import { ExerciseDescriptorEditor } from '@/components/exercises/exercise-descriptor-editor';
import { useLocalSearchParams } from 'expo-router';

export default function ExerciseDescriptorEditorPage() {
  const { exerciseId, isNew } = useLocalSearchParams<{ exerciseId: string; isNew?: string }>();
  return <ExerciseDescriptorEditor exerciseId={exerciseId} isNew={!!isNew} />;
}
