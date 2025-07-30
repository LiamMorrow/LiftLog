import { useAppSelector } from '@/store';
import {
  Material3Scheme,
  useMaterial3Theme,
} from '@pchmn/expo-material3-theme';
import React, { createContext, ReactNode, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import {
  DarkTheme,
  ThemeProvider as NavigationThemeProvider,
  DefaultTheme,
  Theme,
} from '@react-navigation/native';
import { MsIconSrc } from '@/components/presentation/ms-icon-source';
import { Blend } from '@material/material-color-utilities';

export const spacing = {
  pageHorizontalMargin: 16, // spacing[4]
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
  15: 60,
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

export type AppThemeColors = Material3Scheme & {
  orange: string;
  red: string;
};

export type ColorChoice = keyof {
  [K in keyof AppThemeColors as AppThemeColors[K] extends string
    ? K
    : never]: AppThemeColors[K];
};

export interface AppTheme {
  colors: AppThemeColors;
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
  const isDark = colorScheme === 'dark';
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
    // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorSchemeSeed]);
  const schemedTheme = colorScheme === 'dark' ? theme.dark : theme.light;

  const paperTheme = isDark
    ? { ...MD3DarkTheme, colors: theme.dark }
    : { ...MD3LightTheme, colors: theme.light };
  const appTheme = {
    colors: {
      ...schemedTheme,
      orange: argbToHexRGBA(
        Blend.harmonize(0xffffa500, hexToArgb(schemedTheme.primary)),
      ),
      red: argbToHexRGBA(
        Blend.harmonize(0xffff0000, hexToArgb(schemedTheme.primary)),
      ),
    },
    colorScheme: colorScheme ?? 'light',
  };

  const baseNavigationThem = isDark ? DarkTheme : DefaultTheme;
  const navigationTheme: Theme = {
    ...baseNavigationThem,
    colors: {
      background: paperTheme.colors.background,
      border: paperTheme.colors.outline,
      card: paperTheme.colors.surfaceContainer,
      notification: paperTheme.colors.surface,
      primary: paperTheme.colors.primary,
      text: paperTheme.colors.onSurface,
    },
  };

  return (
    <AppThemeContext.Provider value={appTheme}>
      <PaperProvider
        theme={paperTheme}
        settings={{
          icon: (props) => <MsIconSrc {...props} />,
        }}
      >
        <NavigationThemeProvider value={navigationTheme}>
          {children}
        </NavigationThemeProvider>
      </PaperProvider>
    </AppThemeContext.Provider>
  );
};

/**
 * Converts a hex color string (e.g. "#FFAABB" or "#FFAABBCC") to an ARGB number.
 * @param hex - The hex color string.
 * @returns The ARGB number.
 */
function hexToArgb(hexRGBA: string): number {
  hexRGBA = hexRGBA.replace('#', '');
  let a = 255,
    r = 0,
    g = 0,
    b = 0;
  if (hexRGBA.length === 6) {
    r = parseInt(hexRGBA.slice(0, 2), 16);
    g = parseInt(hexRGBA.slice(2, 4), 16);
    b = parseInt(hexRGBA.slice(4, 6), 16);
  } else if (hexRGBA.length === 8) {
    a = parseInt(hexRGBA.slice(6, 8), 16);
    r = parseInt(hexRGBA.slice(0, 2), 16);
    g = parseInt(hexRGBA.slice(2, 4), 16);
    b = parseInt(hexRGBA.slice(4, 6), 16);
  }
  return (
    ((a & 0xff) << 24) | ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff)
  );
}

export function argbToHexRGBA(argb: number): string {
  const a = (argb >> 24) & 0xff;
  const r = (argb >> 16) & 0xff;
  const g = (argb >> 8) & 0xff;
  const b = argb & 0xff;
  return `rgba(${r},${g},${b},${(a / 255).toFixed(3)})`;
}
