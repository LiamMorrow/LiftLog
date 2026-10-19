import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { HeaderHeightContext } from 'expo-router/react-navigation';
import { useContext } from 'react';
import { Platform } from 'react-native';

/**
 * The native header is drawn over the page only where it is liquid glass. Everywhere else it is opaque
 * and the page is laid out below it, so there is nothing to clear.
 */
export const headerOverlapsContent = Platform.OS === 'ios' && isLiquidGlassAvailable();

/** How far the page must push its content down to clear a header drawn over it. */
export function useHeaderInset() {
  // Not useHeaderHeight, which throws outside a stack.
  const headerHeight = useContext(HeaderHeightContext);
  return headerOverlapsContent ? (headerHeight ?? 0) : 0;
}
