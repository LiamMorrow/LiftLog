import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { useMaterial3Theme } from '@pchmn/expo-material3-theme';

// Import your global CSS file
import '../global.css';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { useMemo } from 'react';
import { BaseThemesetProvider } from '@/hooks/useBaseThemeset';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // If the device is not compatible, it will return a theme based on the fallback source color (optional, default to #6750A4)
  const { theme } = useMaterial3Theme({ fallbackSourceColor: '#3E8260' });
  const paperTheme = useMemo(
    () =>
      colorScheme === 'dark'
        ? { ...MD3DarkTheme, colors: theme.dark }
        : { ...MD3LightTheme, colors: theme.light },
    [colorScheme, theme],
  );

  return (
    <PaperProvider theme={paperTheme}>
      <BaseThemesetProvider>
        <Stack />
      </BaseThemesetProvider>
    </PaperProvider>
  );
}
