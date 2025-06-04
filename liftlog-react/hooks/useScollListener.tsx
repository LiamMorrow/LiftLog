import { createContext, useContext, useState, ReactNode } from 'react';

// Create a context with default value
export const ScrollContext = createContext({
  isScrolled: false,
  setScrolled: (_: boolean) => {},
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
  isScrolled,
  setScrolled,
}: ScrollProviderProps) => {
  const [isScrolledG, setScrolledG] = useState(false);

  return (
    <ScrollContext.Provider
      value={{
        isScrolled: isScrolled ?? isScrolledG,
        setScrolled: setScrolled ?? setScrolledG,
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
