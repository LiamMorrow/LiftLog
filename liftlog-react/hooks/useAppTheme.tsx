import {
  Material3Scheme,
  useMaterial3Theme,
} from '@pchmn/expo-material3-theme';
import React, { createContext, ReactNode, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';

const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
  36: 144,
  40: 160,
  44: 176,
  48: 192,
  52: 208,
  56: 224,
  60: 240,
  64: 256,
} as const;

interface AppTheme {
  colors: Material3Scheme;
  spacing: typeof spacing;
}

const BaseThemesetContext = createContext<AppTheme | undefined>(undefined);

export const useAppTheme = (): AppTheme => {
  const context = useContext(BaseThemesetContext);
  if (!context) {
    throw new Error(
      'useBaseThemeset must be used within a BaseThemesetProvider',
    );
  }
  return context;
};

interface BaseThemesetProviderProps {
  children: ReactNode;
}

export const BaseThemesetProvider: React.FC<BaseThemesetProviderProps> = ({
  children,
}) => {
  const colorScheme = useColorScheme();
  // If the device is not compatible, it will return a theme based on the fallback source color (optional, default to #6750A4)
  const { theme } = useMaterial3Theme({ fallbackSourceColor: '#3E8260' });
  const schemedTheme = useMemo(
    () => (colorScheme === 'dark' ? theme.dark : theme.light),
    [colorScheme, theme],
  );
  const paperTheme = useMemo(
    () =>
      colorScheme === 'dark'
        ? { ...MD3DarkTheme, colors: theme.dark }
        : { ...MD3LightTheme, colors: theme.light },
    [colorScheme, theme],
  );
  const appTheme = useMemo(
    () => ({
      colors: schemedTheme,
      spacing,
    }),
    [schemedTheme],
  );

  return (
    <BaseThemesetContext.Provider value={appTheme}>
      <PaperProvider theme={paperTheme}>{children}</PaperProvider>
    </BaseThemesetContext.Provider>
  );
};
