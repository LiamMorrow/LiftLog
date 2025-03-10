import { vars } from 'nativewind';
import React, {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';
import { useTheme } from 'react-native-paper';

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
  const paperTheme = useTheme();

  const style = useMemo<Style>(
    () =>
      vars({
        '--color-primary': hexToRgb(paperTheme.colors.primary),
        '--color-on-primary': hexToRgb(paperTheme.colors.onPrimary),
        '--color-secondary': hexToRgb(paperTheme.colors.secondary),
        '--color-on-secondary': hexToRgb(paperTheme.colors.onSecondary),
        '--color-primary-container': hexToRgb(
          paperTheme.colors.primaryContainer,
        ),
        '--color-on-primary-container': hexToRgb(
          paperTheme.colors.onPrimaryContainer,
        ),
        '--color-secondary-container': hexToRgb(
          paperTheme.colors.secondaryContainer,
        ),
        '--color-on-secondary-container': hexToRgb(
          paperTheme.colors.onSecondaryContainer,
        ),
        '--color-tertiary': hexToRgb(paperTheme.colors.tertiary),
        '--color-on-tertiary': hexToRgb(paperTheme.colors.onTertiary),
        '--color-tertiary-container': hexToRgb(
          paperTheme.colors.tertiaryContainer,
        ),
        '--color-on-tertiary-container': hexToRgb(
          paperTheme.colors.onTertiaryContainer,
        ),
        '--color-background': hexToRgb(paperTheme.colors.background),
        '--color-on-background': hexToRgb(paperTheme.colors.onBackground),
        '--color-surface': hexToRgb(paperTheme.colors.surface),
        '--color-on-surface': hexToRgb(paperTheme.colors.onSurface),
        '--color-on-surface-variant': hexToRgb(
          paperTheme.colors.onSurfaceVariant,
        ),
        '--color-inverse-surface': hexToRgb(paperTheme.colors.inverseSurface),
        '--color-inverse-on-surface': hexToRgb(
          paperTheme.colors.inverseOnSurface,
        ),
        '--color-inverse-primary': hexToRgb(paperTheme.colors.inversePrimary),
        '--color-outline': hexToRgb(paperTheme.colors.outline),
        '--color-outline-variant': hexToRgb(paperTheme.colors.outlineVariant),
        '--color-error': hexToRgb(paperTheme.colors.error),
        '--color-error-container': hexToRgb(paperTheme.colors.errorContainer),
        '--color-on-error': hexToRgb(paperTheme.colors.onError),
        '--color-on-error-container': hexToRgb(
          paperTheme.colors.onErrorContainer,
        ),
      }),
    [paperTheme.colors],
  );

  return (
    <BaseThemesetContext.Provider value={style}>
      {children}
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
