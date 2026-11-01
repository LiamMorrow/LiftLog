import { ProgressionExample } from '@/components/presentation/workout-editor/progressive-overload';
import { useRouteEditorSession } from '@/hooks/useRouteEditor';
import { WeightedExerciseBlueprint } from '@/models/blueprint-models';
import { useLocalSearchParams } from 'expo-router';

export default function ProgressionExamplePage() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const { input } = useRouteEditorSession<WeightedExerciseBlueprint>(requestId);
  if (!input) {
    return null;
  }
  return <ProgressionExample exercise={input} />;
}
