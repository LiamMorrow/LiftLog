import { useAppTheme } from '@/hooks/useAppTheme';
import { GlassView, isLiquidGlassAvailable, type GlassStyle } from 'expo-glass-effect';
import { StyleSheet, View } from 'react-native';

export function GlassBackground({
  radius,
  color,
  tintColor,
  glassEffectStyle = 'regular',
}: {
  radius: number;
  color: string;
  tintColor?: string;
  glassEffectStyle?: GlassStyle;
}) {
  const { colorScheme } = useAppTheme();
  if (!isLiquidGlassAvailable()) {
    return (
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius, backgroundColor: color }]} />
    );
  }
  return (
    <GlassView
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
      glassEffectStyle={glassEffectStyle}
      colorScheme={colorScheme}
      tintColor={tintColor}
    />
  );
}
