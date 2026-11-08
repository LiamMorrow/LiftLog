import { OwnHistoryProvider } from '@/components/history/own-history-provider';
import { PostWorkout } from '@/components/workout/post-workout';
import { useLocalSearchParams } from 'expo-router';

export default function PostWorkoutPage() {
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  return (
    <OwnHistoryProvider>
      <PostWorkout sessionId={sessionId} />
    </OwnHistoryProvider>
  );
}
