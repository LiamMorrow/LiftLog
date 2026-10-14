import { FeedProfileEditor } from '@/components/smart/feed-profile-editor';
import { useLocalSearchParams } from 'expo-router';

export default function FeedProfileEditorPage() {
  const { focusPublish } = useLocalSearchParams<{ focusPublish?: string }>();
  return <FeedProfileEditor focusPublish={!!focusPublish} />;
}
