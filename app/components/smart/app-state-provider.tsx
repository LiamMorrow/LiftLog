import { Loader } from '@/components/presentation/loader';
import { useAppTheme } from '@/hooks/useAppTheme';
import { resolveServices, Services } from '@/services';
import { RootState, useAppSelector } from '@/store';
import { Store } from '@reduxjs/toolkit';
import { ReactNode, createContext, useContext, useMemo } from 'react';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useStore } from 'react-redux';
import { TolgeeProvider } from '@tolgee/react';
import { Text } from 'react-native-paper';

// Create context for services
const ServicesContext = createContext<Services | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const waitingOn = useAppSelector(
    (s) =>
      getLoadMessage(s.app, 'app settings') ||
      getLoadMessage(s.currentSession, 'current session') ||
      getLoadMessage(s.program, 'program') ||
      getLoadMessage(s.settings, 'settings') ||
      getLoadMessage(s.storedSessions, 'stored sessions') ||
      getLoadMessage(s.aiPlanner, 'ai planner'),
  );
  const store = useStore();
  const services = useMemo(
    () => resolveServices(store as Store<RootState>),
    [store],
  );
  const { colors } = useAppTheme();

  if (waitingOn) {
    return (
      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        style={{
          flex: 1,
          backgroundColor: colors.surface,
          alignItems: 'center',
        }}
      >
        <Loader loadingText={waitingOn} />
      </Animated.View>
    );
  }

  return (
    <ServicesContext.Provider value={services}>
      <TolgeeProvider
        tolgee={services.tolgee}
        fallback={<Text>Loading...</Text>}
      >
        {children}
      </TolgeeProvider>
    </ServicesContext.Provider>
  );
}

export function useServices() {
  const ctx = useContext(ServicesContext);
  if (!ctx) throw new Error('useServices must be used within AppStateProvider');
  return ctx;
}

function getLoadMessage(state: { isHydrated: boolean }, type: string) {
  if (state.isHydrated) {
    return undefined;
  }
  return 'Loading ' + type;
}
