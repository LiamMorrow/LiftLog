import { OwnHistoryProvider } from '@/components/smart/own-history-provider';
import { PostWorkout } from '@/components/smart/post-workout';
import { useLocalSearchParams } from 'expo-router';

export default function PostWorkoutPage() {
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  return (
    <OwnHistoryProvider>
      <PostWorkout sessionId={sessionId} />
    </OwnHistoryProvider>
  );
}
