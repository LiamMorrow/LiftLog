import { FeedItem } from '@/components/feed/feed-item';
import { OwnHistoryProvider } from '@/components/history/own-history-provider';
import { useLocalSearchParams } from 'expo-router';

export default function FeedItemPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <OwnHistoryProvider>
      <FeedItem eventId={id} />
    </OwnHistoryProvider>
  );
}
