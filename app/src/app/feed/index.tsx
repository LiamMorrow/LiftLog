import Feed from '@/components/smart/feed';
import { FeedFollowers } from '@/components/smart/feed-followers';
import { FeedFollowing } from '@/components/smart/feed-following';
import { FeedMenu } from '@/components/smart/feed-menu';
import { ScrollProvider, useScroll, useScrollHeaderColor } from '@/hooks/useScrollListener';
import { useAppSelector } from '@/store';
import { selectFollowRequestCount } from '@/store/feed';
import { useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';
import { HeaderHeightContext } from 'expo-router/react-navigation';
import { useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Tabs, TabScreen, TabsProvider } from 'react-native-paper-tabs';

export default function FeedIndexPage() {
  const { t } = useTranslate();
  const followRequestBadgeCount = useAppSelector(selectFollowRequestCount) || undefined;

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
    <>
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
          <TabScreen label={t('feed.following.title')}>
            <ScrollProvider isScrolled={!!tabScrolls[activeTabIndex]} setScrolled={(s) => setTabScrolled(s, 1)}>
              <FeedFollowing />
            </ScrollProvider>
          </TabScreen>
          <TabScreen label={t('feed.followers.title')} badge={followRequestBadgeCount}>
            <ScrollProvider isScrolled={!!tabScrolls[activeTabIndex]} setScrolled={(s) => setTabScrolled(s, 2)}>
              <FeedFollowers />
            </ScrollProvider>
          </TabScreen>
        </Tabs>
      </TabsProvider>
    </>
  );
}
