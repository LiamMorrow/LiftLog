import { MaterialBottomTabs as Tabs } from '@/components/layout/material-bottom-tabs';
import { useAppSelector } from '@/store';
import { selectFollowRequestCount } from '@/store/feed';
import { useTranslate } from '@tolgee/react';
import { Icon } from 'react-native-paper';

export default function Layout() {
  const { t } = useTranslate();
  const followRequestCount = useAppSelector(selectFollowRequestCount);
  const showFeed = useAppSelector((x) => x.settings.showFeed);
  return (
    <Tabs>
      <Tabs.Screen
        name="(session)"
        options={{
          tabBarLabel: t('workout.workout.label'),
          tabBarButtonTestID: 'nav__workout',
          tabBarIcon: ({ color, size, focused }) => {
            return (
              <Icon
                source={focused ? `fitnessCenterFill` : 'fitnessCenter'}
                size={size}
                color={color}
              />
            );
          },
        }}
      />

      <Tabs.Screen
        name="feed"
        redirect={!showFeed}
        options={{
          tabBarLabel: t('feed.feed.title'),

          tabBarButtonTestID: 'nav__feed',
          tabBarBadge: followRequestCount || undefined!,
          tabBarIcon: ({ color, size, focused }) => {
            return (
              <Icon
                source={focused ? `forumFill` : 'forum'}
                size={size}
                color={color}
              />
            );
          },
        }}
      />

      <Tabs.Screen
        name="progress"
        options={{
          tabBarLabel: t('progress.title'),
          tabBarButtonTestID: 'nav__progress',
          tabBarIcon: ({ color, size, focused }) => {
            return (
              <Icon
                source={focused ? `analyticsFill` : 'analytics'}
                size={size}
                color={color}
              />
            );
          },
        }}
      />
      <Tabs.Screen name="stats" options={{ href: null }} />
      <Tabs.Screen name="history" options={{ href: null }} />

      <Tabs.Screen
        name="settings"
        options={{
          tabBarLabel: t('settings.settings.title'),
          tabBarButtonTestID: 'nav__settings',
          tabBarIcon: ({ color, size, focused }) => {
            return (
              <Icon
                source={focused ? `settingsFill` : 'settings'}
                size={size}
                color={color}
              />
            );
          },
        }}
      />
    </Tabs>
  );
}
