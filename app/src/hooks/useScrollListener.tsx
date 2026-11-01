import { NavigationRouteContext } from 'expo-router/react-navigation';
import { createContext, useContext, useState, ReactNode } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

type ScrollContextValues = {
  scrolledRoutes: ReadonlySet<string>;
  setRouteScrolled: (routeKey: string, scrolled: boolean) => void;
};

const ScrollContext = createContext<ScrollContextValues>({
  scrolledRoutes: new Set(),
  setRouteScrolled: () => {},
});

export function ScrollProvider({ children }: { children: ReactNode }) {
  const [scrolledRoutes, setScrolledRoutes] = useState<ReadonlySet<string>>(() => new Set());

  const setRouteScrolled = (routeKey: string, scrolled: boolean) =>
    setScrolledRoutes((current) => {
      if (current.has(routeKey) === scrolled) {
        return current;
      }
      const next = new Set(current);
      if (scrolled) {
        next.add(routeKey);
      } else {
        next.delete(routeKey);
      }
      return next;
    });

  return <ScrollContext value={{ scrolledRoutes, setRouteScrolled }}>{children}</ScrollContext>;
}

export function useScrolledRoutes() {
  return useContext(ScrollContext).scrolledRoutes;
}

export function useScroll(invertedScroll?: boolean) {
  const { setRouteScrolled } = useContext(ScrollContext);
  const route = useContext(NavigationRouteContext);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!route) {
      return;
    }
    const offsetY = event.nativeEvent.contentOffset.y;
    const scrollHeight = event.nativeEvent.contentSize.height - event.nativeEvent.layoutMeasurement.height;
    setRouteScrolled(route.key, invertedScroll ? offsetY < scrollHeight : offsetY > 0);
  };

  return { handleScroll };
}
