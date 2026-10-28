import { FeedSettings, FeedSettingsFocus } from '@/components/smart/feed-settings';
import { useLocalSearchParams } from 'expo-router';

export default function FeedSettingsPage() {
  const { focus } = useLocalSearchParams<{ focus?: FeedSettingsFocus }>();
  return <FeedSettings focus={focus} />;
}
