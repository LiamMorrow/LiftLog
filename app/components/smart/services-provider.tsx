import { resolveServices, Services } from '@/services';
import { RootState } from '@/store';
import { Store } from '@reduxjs/toolkit';
import { TolgeeProvider } from '@tolgee/react';
import { createContext, ReactNode, useContext, useMemo } from 'react';
import { useStore } from 'react-redux';

// Create context for services
const ServicesContext = createContext<Services | null>(null);
export default function ServicesProvider(props: { children: ReactNode }) {
  const store = useStore();
  const services = useMemo(
    () => resolveServices(store as Store<RootState>),
    [store],
  );

  return (
    <ServicesContext.Provider value={services}>
      <TolgeeProvider tolgee={services.tolgee}>{props.children}</TolgeeProvider>
    </ServicesContext.Provider>
  );
}
export function useServices() {
  const ctx = useContext(ServicesContext);
  if (!ctx) throw new Error('useServices must be used within AppStateProvider');
  return ctx;
}
