import Feed from '@/components/smart/feed';
import { FeedFriends } from '@/components/smart/feed-friends';
import { FeedMenu } from '@/components/smart/feed-menu';
import { OwnHistoryProvider } from '@/components/smart/own-history-provider';
import { useHeaderInset } from '@/hooks/useHeaderInset';
import { useFeedHubLease } from '@/hooks/useFeedHubLease';
import { ScrollProvider, useScroll, useScrollHeaderColor } from '@/hooks/useScrollListener';
import { useAppSelector } from '@/store';
import { fetchInboxItems, selectIncomingFriendRequestCount } from '@/store/feed';
import { useTranslate } from '@tolgee/react';
import { Stack, useFocusEffect } from 'expo-router';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Tabs, TabScreen, TabsProvider } from 'react-native-paper-tabs';

export default function FeedIndexPage() {
  const { t } = useTranslate();
  const friendRequestBadgeCount = useAppSelector(selectIncomingFriendRequestCount) || undefined;

  const { setScrolled } = useScroll();
  const headerColor = useScrollHeaderColor();

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [tabScrolls, setTabScrolls] = useState<Record<number, boolean>>({});
  const setTabScrolled = (isScrolled: boolean, tabIndex: number) => {
    if (tabScrolls[tabIndex] !== isScrolled) {
      setTabScrolls((x) => ({ ...x, [tabIndex]: isScrolled }));
    }
  };

  useEffect(() => {
    setScrolled(!!tabScrolls[activeTabIndex]);
  }, [tabScrolls, activeTabIndex, setScrolled]);

  const headerInset = useHeaderInset();
  const dispatch = useDispatch();
  useFocusEffect(() => {
    dispatch(fetchInboxItems({ fromUserAction: false }));
  });
  useFeedHubLease('viewer', true);
  return (
    <OwnHistoryProvider>
      <Stack.Screen options={{ title: t('feed.feed.title') }} />
      <FeedMenu />
      <TabsProvider onChangeIndex={setActiveTabIndex}>
        <Tabs
          tabHeaderStyle={{
            backgroundColor: headerColor,
            paddingTop: headerInset,
          }}
          style={{
            backgroundColor: 'transparent',
          }}
        >
          <TabScreen label={t('feed.feed.title')}>
            <ScrollProvider isScrolled={!!tabScrolls[activeTabIndex]} setScrolled={(s) => setTabScrolled(s, 0)}>
              <Feed />
            </ScrollProvider>
          </TabScreen>
          <TabScreen label={t('feed.friends.title')} badge={friendRequestBadgeCount}>
            <ScrollProvider isScrolled={!!tabScrolls[activeTabIndex]} setScrolled={(s) => setTabScrolled(s, 1)}>
              <FeedFriends />
            </ScrollProvider>
          </TabScreen>
        </Tabs>
      </TabsProvider>
    </OwnHistoryProvider>
  );
}
