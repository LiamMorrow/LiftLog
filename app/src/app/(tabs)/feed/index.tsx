import Feed from '@/components/smart/feed';
import { FeedFriends } from '@/components/smart/feed-friends';
import { FeedMenu } from '@/components/smart/feed-menu';
import { OwnHistoryProvider } from '@/components/smart/own-history-provider';
import { ScrollProvider, useScroll, useScrollHeaderColor } from '@/hooks/useScrollListener';
import { useAppSelector } from '@/store';
import { selectIncomingFriendRequestCount } from '@/store/feed';
import { useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';
import { HeaderHeightContext } from 'expo-router/react-navigation';
import { useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
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

  const headerHeight = useContext(HeaderHeightContext); // Intentionally don't use useHeaderHeight as it might not be in a stack
  const topInsetHeight = Platform.select({ ios: headerHeight }) ?? 0;
  return (
    <OwnHistoryProvider>
      <Stack.Screen options={{ title: t('feed.feed.title') }} />
      <FeedMenu />
      <TabsProvider onChangeIndex={setActiveTabIndex}>
        <Tabs
          tabHeaderStyle={{
            backgroundColor: headerColor,
            paddingTop: topInsetHeight,
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
