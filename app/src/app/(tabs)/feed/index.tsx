import Feed from '@/components/smart/feed';
import { FeedMenu } from '@/components/smart/feed-menu';
import { OwnHistoryProvider } from '@/components/smart/own-history-provider';
import { useFeedHubLease } from '@/hooks/useFeedHubLease';
import { fetchInboxItems } from '@/store/feed';
import { useTranslate } from '@tolgee/react';
import { Stack, useFocusEffect } from 'expo-router';
import { useDispatch } from 'react-redux';

export default function FeedIndexPage() {
  const { t } = useTranslate();
  const dispatch = useDispatch();
  useFocusEffect(() => {
    dispatch(fetchInboxItems({ fromUserAction: false }));
  });
  useFeedHubLease('viewer', true);
  return (
    <OwnHistoryProvider>
      <Stack.Screen options={{ title: t('feed.feed.title') }} />
      <FeedMenu />
      <Feed />
    </OwnHistoryProvider>
  );
}
