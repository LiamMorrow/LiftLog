import { Loader } from '@/components/presentation/loader';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useAppSelector } from '@/store';
import { ReactNode } from 'react';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export default function AppStateProvider(props: { children: ReactNode }) {
  const waitingOn = useAppSelector(
    (s) =>
      getLoadMessage(s.app, 'app settings') ||
      getLoadMessage(s.currentSession, 'current session') ||
      getLoadMessage(s.program, 'program') ||
      getLoadMessage(s.settings, 'settings') ||
      getLoadMessage(s.storedSessions, 'stored sessions') ||
      getLoadMessage(s.aiPlanner, 'ai planner'),
  );
  const { colors } = useAppTheme();

  return !waitingOn ? (
    props.children
  ) : (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      style={{ flex: 1, backgroundColor: colors.surface, alignItems: 'center' }}
    >
      <Loader loadingText={waitingOn} />
    </Animated.View>
  );
}

function getLoadMessage(state: { isHydrated: boolean }, type: string) {
  if (state.isHydrated) {
    return undefined;
  }
  return 'Loading ' + type;
}
