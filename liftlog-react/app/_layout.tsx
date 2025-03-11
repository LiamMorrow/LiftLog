import { Stack } from 'expo-router';
import { StrictMode } from 'react';
import { BaseThemesetProvider } from '@/hooks/useAppTheme';

export default function RootLayout() {
  return (
    <BaseThemesetProvider>
      <Stack />
    </BaseThemesetProvider>
  );
}
