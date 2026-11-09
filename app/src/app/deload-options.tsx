import { DeloadOptions } from '@/components/workout/deload-options';
import { useLocalSearchParams } from 'expo-router';

export default function DeloadOptionsPage() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  return <DeloadOptions sessionId={sessionId} />;
}
