import MaterialScrollHeaderBackground from '@/components/layout/material-scroll-header-background';
import { ScrollProvider } from '@/hooks/useScrollListener';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function StackWithHeader() {
  return (
    <ScrollProvider>
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
          headerLargeTitleEnabled: Platform.OS === 'android',
          headerTitleAlign: 'center',
          headerBackground: Platform.OS === 'ios' ? undefined : () => <MaterialScrollHeaderBackground />,
          gestureEnabled: true,
          headerTransparent: Platform.OS === 'ios',
        }}
      ></Stack>
    </ScrollProvider>
  );
}
