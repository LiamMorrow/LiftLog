import { FeedItem } from '@/components/smart/feed-item';
import { OwnHistoryProvider } from '@/components/smart/own-history-provider';
import { useLocalSearchParams } from 'expo-router';

export default function FeedItemPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <OwnHistoryProvider>
      <FeedItem eventId={id} />
    </OwnHistoryProvider>
  );
}
