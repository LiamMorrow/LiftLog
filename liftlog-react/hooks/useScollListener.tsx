import { createContext, useContext, useState, ReactNode } from 'react';

// Create a context with default value
const ScrollContext = createContext({
  isScrolled: false,
  setScrolled: (scrolled: boolean) => {},
});

// Create a provider component
export const ScrollProvider = ({ children }: { children: ReactNode }) => {
  const [isScrolled, setScrolled] = useState(false);

  return (
    <ScrollContext.Provider value={{ isScrolled, setScrolled }}>
      {children}
    </ScrollContext.Provider>
  );
};

// Create a hook to use the ScrollContext
export const useScroll = () => {
  return useContext(ScrollContext);
};
