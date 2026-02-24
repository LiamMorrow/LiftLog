import { useAppTheme } from '@/hooks/useAppTheme';
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import {
  Animated,
  ColorValue,
  NativeScrollEvent,
  NativeSyntheticEvent,
  useAnimatedValue,
} from 'react-native';

type ScrollContextValues = {
  isScrolled: boolean;
  setScrolled: (_: boolean) => void;
  handleScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

// Create a context with default value
export const ScrollContext = createContext<ScrollContextValues>({
  isScrolled: false,
  setScrolled: (_: boolean) => {},
  handleScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => {},
});

type ScrollProviderCallbackProps =
  | {
      setScrolled: (scroll: boolean) => void;
      isScrolled: boolean;
    }
  | {
      setScrolled?: undefined;
      isScrolled?: undefined;
    };

type ScrollProviderProps = {
  children: ReactNode;
} & ScrollProviderCallbackProps;

// Create a provider component
export const ScrollProvider = ({
  children,
  isScrolled: isScrolledOverride,
  setScrolled: setScrolledOverride,
}: ScrollProviderProps) => {
  const [isScrolledGlobal, setScrolledGlobal] = useState(false);

  return (
    <ScrollContext.Provider
      value={{
        isScrolled: isScrolledOverride ?? isScrolledGlobal,
        setScrolled: setScrolledOverride ?? setScrolledGlobal,
        handleScroll: () => {},
      }}
    >
      {children}
    </ScrollContext.Provider>
  );
};

// Create a hook to use the ScrollContext
export const useScroll = (invertedScroll?: boolean): ScrollContextValues => {
  const ctx = useContext(ScrollContext);
  const [scrollHandlerLastFired, setScrollHandlerLastFired] = useState<
    boolean | undefined
  >(undefined);
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;
    const scrollHeight = contentHeight - layoutHeight;
    const isScrolled = invertedScroll ? offsetY < scrollHeight : offsetY > 0;
    if (scrollHandlerLastFired === isScrolled) {
      return;
    }
    setScrollHandlerLastFired(isScrolled);
    ctx.setScrolled(isScrolled);
  };
  return {
    ...ctx,
    handleScroll,
  };
};

export const useScrollHeaderColor = (): ColorValue => {
  const { isScrolled } = useScroll();
  const { colors } = useAppTheme();
  const scrollColor = useAnimatedValue(0);

  useEffect(() => {
    Animated.timing(scrollColor, {
      toValue: isScrolled ? 1 : 0,
      duration: 200,
      useNativeDriver: false, // color interpolation can't use native driver
    }).start();
  }, [isScrolled, scrollColor]);

  // Interpolate background color
  const backgroundColor = scrollColor.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.surface, colors.surfaceContainer],
  }) as unknown as ColorValue;

  return backgroundColor;
};
