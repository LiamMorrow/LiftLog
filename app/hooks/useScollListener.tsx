import { createContext, useContext, useState, ReactNode } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

// Create a context with default value
export const ScrollContext = createContext({
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
  const [scrollHandlerLastFired, setScrollHandlerLastFired] = useState<
    boolean | undefined
  >(undefined);

  return (
    <ScrollContext.Provider
      value={{
        isScrolled: isScrolledOverride ?? isScrolledGlobal,
        setScrolled: setScrolledOverride ?? setScrolledGlobal,
        handleScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
          const offsetY = event.nativeEvent.contentOffset.y;
          const isScrolled = offsetY > 0;
          if (scrollHandlerLastFired === isScrolled) {
            return;
          }
          setScrollHandlerLastFired(isScrolled);
          if (setScrolledOverride) setScrolledOverride(isScrolled);
          else setScrolledGlobal(isScrolled);
        },
      }}
    >
      {children}
    </ScrollContext.Provider>
  );
};

// Create a hook to use the ScrollContext
export const useScroll = () => {
  return useContext(ScrollContext);
};
