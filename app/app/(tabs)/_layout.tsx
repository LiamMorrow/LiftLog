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
        name="dashboard"
        options={{
          tabBarLabel: 'Dashboard',
          tabBarButtonTestID: 'nav__dashboard',
          tabBarIcon: ({ color, size, focused }) => (
            <Icon
              source={focused ? 'shieldFill' : 'shield'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="(session)"
        options={{
          tabBarLabel: 'Treinar',
          tabBarButtonTestID: 'nav__workout',
          tabBarIcon: ({ color, size, focused }) => (
            <Icon
              source={focused ? 'fitnessCenterFill' : 'fitnessCenter'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          tabBarLabel: 'Quest Log',
          tabBarButtonTestID: 'nav__history',
          tabBarIcon: ({ color, size, focused }) => (
            <Icon
              source={focused ? 'menuBookFill' : 'menuBook'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="feed"
        redirect={!showFeed}
        options={{
          tabBarLabel: 'Guilda',
          tabBarButtonTestID: 'nav__feed',
          tabBarBadge: followRequestCount || undefined!,
          tabBarIcon: ({ color, size, focused }) => (
            <Icon
              source={focused ? 'groupsFill' : 'groups'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="stats"
        options={{
          tabBarLabel: t('stats.stats.title'),
          tabBarButtonTestID: 'nav__stats',
          tabBarIcon: ({ color, size, focused }) => (
            <Icon
              source={focused ? 'analyticsFill' : 'analytics'}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          tabBarLabel: 'Herói',
          tabBarButtonTestID: 'nav__settings',
          tabBarIcon: ({ color, size, focused }) => (
            <Icon
              source={focused ? 'personFill' : 'person'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
