import { useMaterial3Theme } from '@pchmn/expo-material3-theme';
import { vars } from 'nativewind';
import React, { createContext, ReactNode, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';

interface Style {
  [key: string]: string;
}

const BaseThemesetContext = createContext<Style | undefined>(undefined);

export const useBaseThemeset = (): Style => {
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

  const style = useMemo<Style>(() => {
    console.log(schemedTheme);
    return vars({
      '--color-primary': hexToRgb(schemedTheme.primary),
      '--color-on-primary': hexToRgb(schemedTheme.onPrimary),
      '--color-secondary': hexToRgb(schemedTheme.secondary),
      '--color-on-secondary': hexToRgb(schemedTheme.onSecondary),
      '--color-primary-container': hexToRgb(schemedTheme.primaryContainer),
      '--color-on-primary-container': hexToRgb(schemedTheme.onPrimaryContainer),
      '--color-secondary-container': hexToRgb(schemedTheme.secondaryContainer),
      '--color-on-secondary-container': hexToRgb(
        schemedTheme.onSecondaryContainer,
      ),
      '--color-tertiary': hexToRgb(schemedTheme.tertiary),
      '--color-on-tertiary': hexToRgb(schemedTheme.onTertiary),
      '--color-tertiary-container': hexToRgb(schemedTheme.tertiaryContainer),
      '--color-on-tertiary-container': hexToRgb(
        schemedTheme.onTertiaryContainer,
      ),
      '--color-background': hexToRgb(schemedTheme.background),
      '--color-on-background': hexToRgb(schemedTheme.onBackground),
      '--color-surface': hexToRgb(schemedTheme.surface),
      '--color-surface-container-highest': hexToRgb(
        schemedTheme.surfaceContainerHighest,
      ),
      '--color-on-surface': hexToRgb(schemedTheme.onSurface),
      '--color-on-surface-variant': hexToRgb(schemedTheme.onSurfaceVariant),
      '--color-inverse-surface': hexToRgb(schemedTheme.inverseSurface),
      '--color-inverse-on-surface': hexToRgb(schemedTheme.inverseOnSurface),
      '--color-surface-container': hexToRgb(schemedTheme.surfaceContainer),
      '--color-surface-container-high': hexToRgb(
        schemedTheme.surfaceContainerHigh,
      ),
      '--color-surface-container-low': hexToRgb(
        schemedTheme.surfaceContainerLow,
      ),
      '--color-inverse-primary': hexToRgb(schemedTheme.inversePrimary),
      '--color-outline': hexToRgb(schemedTheme.outline),
      '--color-outline-variant': hexToRgb(schemedTheme.outlineVariant),
      '--color-error': hexToRgb(schemedTheme.error),
      '--color-error-container': hexToRgb(schemedTheme.errorContainer),
      '--color-on-error': hexToRgb(schemedTheme.onError),
      '--color-on-error-container': hexToRgb(schemedTheme.onErrorContainer),
    });
  }, [schemedTheme]);

  return (
    <BaseThemesetContext.Provider value={style}>
      <PaperProvider theme={paperTheme}>{children}</PaperProvider>
    </BaseThemesetContext.Provider>
  );
};

const hexToRgb = (hex: string): string => {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r} ${g} ${b}`;
};
