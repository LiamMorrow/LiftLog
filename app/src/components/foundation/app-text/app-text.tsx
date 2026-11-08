import { ColorChoice, useAppTheme } from '@/hooks/useAppTheme';
import { I18nManager, Platform, Text as NativeText, TextProps as NativeTextProps, TextStyle } from 'react-native';

const regularFamily = Platform.select({ ios: 'System', default: 'sans-serif' });
const mediumFamily = Platform.select({ ios: 'System', default: 'sans-serif-medium' });

const regular: TextStyle = { fontFamily: regularFamily, fontWeight: '400', letterSpacing: 0 };
const medium: TextStyle = { fontFamily: mediumFamily, fontWeight: '500', letterSpacing: 0.15 };
const body: TextStyle = { ...medium, fontFamily: regularFamily, fontWeight: '400' };

export const textVariants = {
  displaySmall: { ...regular, fontSize: 36, lineHeight: 44 },
  headlineLarge: { ...regular, fontSize: 32, lineHeight: 40 },
  headlineMedium: { ...regular, fontSize: 28, lineHeight: 36 },
  headlineSmall: { ...regular, fontSize: 24, lineHeight: 32 },
  titleLarge: { ...regular, fontSize: 22, lineHeight: 28 },
  titleMedium: { ...medium, fontSize: 16, lineHeight: 24 },
  titleSmall: { ...medium, letterSpacing: 0.1, fontSize: 14, lineHeight: 20 },
  labelLarge: { ...medium, letterSpacing: 0.1, fontSize: 14, lineHeight: 20 },
  labelMedium: { ...medium, letterSpacing: 0.5, fontSize: 12, lineHeight: 16 },
  labelSmall: { ...medium, letterSpacing: 0.5, fontSize: 11, lineHeight: 16 },
  bodyLarge: { ...body, fontSize: 16, lineHeight: 24 },
  bodyMedium: { ...body, letterSpacing: 0.25, fontSize: 14, lineHeight: 20 },
  bodySmall: { ...body, letterSpacing: 0.4, fontSize: 12, lineHeight: 16 },
} satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof textVariants;

export interface AppTextProps extends NativeTextProps {
  variant?: TextVariant;
  color?: ColorChoice;
}

export function AppText({ variant, color, style, ...rest }: AppTextProps) {
  const { colors } = useAppTheme();
  return (
    <NativeText
      {...rest}
      style={[
        {
          textAlign: 'left',
          writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
          color: colors[color ?? 'onSurface'],
        },
        variant ? textVariants[variant] : regular,
        style,
      ]}
    />
  );
}
