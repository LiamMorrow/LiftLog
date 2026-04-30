import { useWindowDimensions } from 'react-native';

export function useRpgFontSize(base: number): number {
  const { width } = useWindowDimensions();
  if (width < 360) return Math.max(8, Math.floor(base * 0.7));
  if (width < 390) return Math.max(10, Math.floor(base * 0.85));
  return base;
}
