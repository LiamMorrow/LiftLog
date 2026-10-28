import { ExerciseDescriptorEditor } from '@/components/smart/exercise-descriptor-editor';
import { useLocalSearchParams } from 'expo-router';

export default function ExerciseDescriptorEditorPage() {
  const { exerciseId, isNew } = useLocalSearchParams<{ exerciseId: string; isNew?: string }>();
  return <ExerciseDescriptorEditor exerciseId={exerciseId} isNew={!!isNew} />;
}
