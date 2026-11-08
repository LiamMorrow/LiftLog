import { FeedFriends } from '@/components/feed/feed-friends';
import { OwnHistoryProvider } from '@/components/history/own-history-provider';
import { useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';

export default function FeedFriendsPage() {
  const { t } = useTranslate();
  return (
    <OwnHistoryProvider>
      <Stack.Screen options={{ title: t('feed.friends.title') }} />
      <FeedFriends />
    </OwnHistoryProvider>
  );
}
