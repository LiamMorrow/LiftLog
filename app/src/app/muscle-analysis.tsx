import { MuscleAnalysis } from '@/components/smart/muscle-analysis';
import { useLocalSearchParams } from 'expo-router';

export default function MuscleAnalysisPage() {
  const { programId } = useLocalSearchParams<{ programId: string }>();
  return <MuscleAnalysis programId={programId} />;
}
