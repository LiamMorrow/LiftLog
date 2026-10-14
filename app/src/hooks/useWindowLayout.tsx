import { useWindowDimensions } from 'react-native';

export function useIsLandscape() {
  const { width, height } = useWindowDimensions();
  return width > height;
}
