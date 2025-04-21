import { useAppSelector } from '@/store';
import {
  Material3Scheme,
  useMaterial3Theme,
} from '@pchmn/expo-material3-theme';
import React, { createContext, ReactNode, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';

export const spacing = {
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

export const font = {
  'text-2xs': {
    fontSize: 10,
    lineHeight: 14,
  },
  'text-xs': {
    fontSize: 12,
    lineHeight: 16,
  },
  'text-sm': {
    fontSize: 14,
    lineHeight: 20,
  },
  'text-base': {
    fontSize: 16,
    lineHeight: 24,
  },
  'text-lg': {
    fontSize: 18,
    lineHeight: 28,
  },
  'text-xl': {
    fontSize: 20,
    lineHeight: 28,
  },
  'text-2xl': {
    fontSize: 24,
    lineHeight: 32,
  },
  'text-3xl': {
    fontSize: 30,
    lineHeight: 40,
  },
} as const;

export type FontChoice = keyof typeof font;

export interface AppTheme {
  colors: Material3Scheme;
  colorScheme: 'light' | 'dark';
}

const AppThemeContext = createContext<AppTheme | undefined>(undefined);

export const useAppTheme = (): AppTheme => {
  const context = useContext(AppThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a AppThemeProvider');
  }
  return context;
};

interface AppThemeProviderProps {
  children: ReactNode;
}

export const AppThemeProvider: React.FC<AppThemeProviderProps> = ({
  children,
}) => {
  const colorSchemeSeed = useAppSelector(
    (state) => state.settings.colorSchemeSeed,
  );

  const colorScheme = useColorScheme();
  // If the device is not compatible, it will return a theme based on the fallback source color (optional, default to #6750A4)
  const { theme, updateTheme, resetTheme } = useMaterial3Theme({
    fallbackSourceColor: '0x00AA00',
    sourceColor: colorSchemeSeed === 'default' ? undefined! : colorSchemeSeed,
  });
  useEffect(() => {
    if (colorSchemeSeed === 'default') {
      resetTheme();
    } else {
      updateTheme(colorSchemeSeed);
    }
  }, [colorSchemeSeed]);
  const schemedTheme = colorScheme === 'dark' ? theme.dark : theme.light;

  const paperTheme =
    colorScheme === 'dark'
      ? { ...MD3DarkTheme, colors: theme.dark }
      : { ...MD3LightTheme, colors: theme.light };
  const appTheme = {
    colors: schemedTheme,
    colorScheme: colorScheme ?? 'light',
  };

  return (
    <AppThemeContext.Provider value={appTheme}>
      <PaperProvider
        theme={paperTheme}
        // settings={{
        //   icon: ({ name, ...rest }) => (
        //     <MsIcon
        //       icon={mst}
        //       {...rest}
        //     />
        //   ),
        // }}
      >
        {children}
      </PaperProvider>
    </AppThemeContext.Provider>
  );
};
