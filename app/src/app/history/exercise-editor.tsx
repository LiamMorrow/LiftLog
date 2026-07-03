import { SessionExerciseEditor } from '@/components/smart/session-exercise-editor';
import { useLocalSearchParams } from 'expo-router';

export default function HistoryExerciseEditorPage() {
  const { index, isNew } = useLocalSearchParams<{ index: string; isNew?: string }>();
  return <SessionExerciseEditor target="historySession" index={Number(index)} isNew={!!isNew} />;
}
