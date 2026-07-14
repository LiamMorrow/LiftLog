import { FeedItem } from '@/components/smart/feed-item';
import { useLocalSearchParams } from 'expo-router';

export default function FeedItemPage() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <FeedItem eventId={id} />;
}
