import { MaterialBottomTabs as Tabs } from '@/components/presentation/material-bottom-tabs';
import { ScrollProvider } from '@/hooks/useScollListener';
import { Icon } from 'react-native-paper';

export default function Layout() {
  return (
    <ScrollProvider>
      <Tabs>
        <Tabs.Screen
          name="(session)"
          options={{
            tabBarLabel: 'Workout',
            tabBarIcon: ({ color, size }) => {
              return <Icon source="weight" size={size} color={color} />;
            },
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            tabBarLabel: 'Settings',
            tabBarIcon: ({ color, size }) => {
              return <Icon source="cog" size={size} color={color} />;
            },
          }}
        />
      </Tabs>
    </ScrollProvider>
  );
}
