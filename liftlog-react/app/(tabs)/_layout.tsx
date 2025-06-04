import { MaterialBottomTabs as Tabs } from '@/components/presentation/material-bottom-tabs';
import { useAppSelector } from '@/store';
import { selectFollowRequestCount } from '@/store/feed';
import { useTranslate } from '@tolgee/react';
import { Icon } from 'react-native-paper';

export default function Layout() {
  const { t } = useTranslate();
  const followRequestCount = useAppSelector(selectFollowRequestCount);
  return (
    <Tabs>
      <Tabs.Screen
        name="(session)"
        options={{
          tabBarLabel: t('Workout'),
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
        options={{
          tabBarLabel: t('Feed'),
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
          tabBarLabel: t('Stats'),
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
          tabBarLabel: t('History'),
          tabBarIcon: ({ color, size }) => {
            return <Icon source={'history'} size={size} color={color} />;
          },
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          tabBarLabel: t('Settings'),
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
