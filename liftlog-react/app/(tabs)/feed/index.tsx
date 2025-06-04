import FullHeightScrollView from '@/components/presentation/full-height-scroll-view';
import { SurfaceText } from '@/components/presentation/surface-text';
import Feed from '@/components/smart/feed';
import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { ScrollProvider, useScroll } from '@/hooks/useScollListener';
import { useAppSelector } from '@/store';
import { selectFollowRequestCount } from '@/store/feed';
import { useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, ColorValue, useAnimatedValue } from 'react-native';
import { Tabs, TabScreen, TabsProvider } from 'react-native-paper-tabs';

export default function FeedIndexPage() {
  const { t } = useTranslate();
  const followRequestBadgeCount =
    useAppSelector(selectFollowRequestCount) || undefined;

  const { isScrolled, setScrolled } = useScroll();

  const { colors } = useAppTheme();
  const scrollColor = useAnimatedValue(0);

  useEffect(() => {
    Animated.timing(scrollColor, {
      toValue: isScrolled ? 1 : 0,
      duration: 200,
      useNativeDriver: false, // color interpolation can't use native driver
    }).start();
  }, [isScrolled, scrollColor]);

  // Interpolate background color
  const backgroundColor = scrollColor.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.surface, colors.surfaceContainer],
  }) as unknown as ColorValue;

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

  return (
    <>
      <Stack.Screen options={{ title: t('Feed') }} />
      <TabsProvider onChangeIndex={setActiveTabIndex}>
        <Tabs
          tabHeaderStyle={{ backgroundColor }}
          style={{ backgroundColor: 'transparent' }}
        >
          <TabScreen label={t('Feed')}>
            <ScrollProvider
              isScrolled={!!tabScrolls[activeTabIndex]}
              setScrolled={(s) => setTabScrolled(s, 0)}
            >
              <Feed />
            </ScrollProvider>
          </TabScreen>
          <TabScreen label={t('Feed_Following')}>
            <SurfaceText>hihi</SurfaceText>
          </TabScreen>
          <TabScreen
            label={t('Feed_Followers')}
            badge={followRequestBadgeCount!}
          >
            <FullHeightScrollView contentContainerStyle={{ gap: spacing[4] }}>
              <SurfaceText>hihi</SurfaceText>
            </FullHeightScrollView>
          </TabScreen>
        </Tabs>
      </TabsProvider>
    </>
  );
}
