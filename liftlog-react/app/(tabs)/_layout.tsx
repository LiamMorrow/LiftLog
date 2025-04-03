import { MaterialBottomTabs as Tabs } from '@/components/presentation/material-bottom-tabs';
import { useTranslate } from '@tolgee/react';
import { Icon } from 'react-native-paper';

export default function Layout() {
  const { t } = useTranslate();
  return (
    <Tabs>
      <Tabs.Screen
        name="(session)"
        options={{
          tabBarLabel: t('Workout'),
          tabBarIcon: ({ color, size }) => {
            return <Icon source="fitness_center" size={size} color={color} />;
          },
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          tabBarLabel: t('Settings'),
          tabBarIcon: ({ color, size }) => {
            return <Icon source="settings" size={size} color={color} />;
          },
        }}
      />
    </Tabs>
  );
}
