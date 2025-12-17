import { MaterialBottomTabs as Tabs } from '@/components/presentation/material-bottom-tabs';
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
        name="stats"
        options={{
          tabBarLabel: t('stats.stats.title'),
          tabBarButtonTestID: 'nav__stats',
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

      <Tabs.Screen
        name="history"
        options={{
          tabBarLabel: t('generic.history.title'),
          tabBarButtonTestID: 'nav__history',
          tabBarIcon: ({ color, size }) => {
            return <Icon source={'history'} size={size} color={color} />;
          },
        }}
      />

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
