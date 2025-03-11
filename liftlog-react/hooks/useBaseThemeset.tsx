import {
  Material3Scheme,
  useMaterial3Theme,
} from '@pchmn/expo-material3-theme';
import React, { createContext, ReactNode, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';

const BaseThemesetContext = createContext<Material3Scheme | undefined>(
  undefined,
);

export const useBaseThemeset = (): Material3Scheme => {
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

  return (
    <BaseThemesetContext.Provider value={schemedTheme}>
      <PaperProvider theme={paperTheme}>{children}</PaperProvider>
    </BaseThemesetContext.Provider>
  );
};
