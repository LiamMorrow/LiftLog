import { Loader } from '@/components/foundation/loader';
import { ReportProblemActions } from '@/components/app-shell/report-problem-actions';
import { useAppTheme, spacing } from '@/hooks/useAppTheme';
import { useAppSelector } from '@/store';
import { T } from '@tolgee/react';
import { ReactNode, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

const STUCK_TIMEOUT_MS = 7_000;

export function AppStateProvider({ children }: { children: ReactNode }) {
  const waitingOn = useAppSelector(
    (s) =>
      getLoadMessage(s.app, 'app settings') ||
      getLoadMessage(s.program, 'program') ||
      getLoadMessage(s.settings, 'settings') ||
      getLoadMessage(s.storedSessions, 'stored sessions'),
  );
  const isUpcomingLoaded = useAppSelector((s) => s.program.upcomingSessions.isSuccess());
  const isHydrated = !waitingOn;
  const isReady = isHydrated && isUpcomingLoaded;
  const isStuck = useIsStuck();
  const showStuck = !isReady && isStuck;

  useEffect(() => {
    if (isReady || showStuck) {
      SplashScreen.hide();
    }
  }, [isReady, showStuck]);

  return (
    <>
      {isReady && children}
      {showStuck && <StuckScreen loadingText={waitingOn ?? 'Loading upcoming workouts'} />}
    </>
  );
}

function useIsStuck() {
  const [isStuck, setIsStuck] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsStuck(true), STUCK_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);
  return isStuck;
}

function StuckScreen({ loadingText }: { loadingText: string }) {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
      ]}
    >
      <View>
        <Loader loadingText={loadingText} />
      </View>
      <StuckHelp />
    </View>
  );
}

function StuckHelp() {
  const { colors } = useAppTheme();

  return (
    <View style={{ alignItems: 'center', gap: spacing[2] }}>
      <Text style={{ color: colors.onSurfaceVariant, textAlign: 'center' }}>
        <T keyName="app.stuck_loading.message" />
      </Text>
      <ReportProblemActions />
    </View>
  );
}

function getLoadMessage(state: { isHydrated: boolean }, type: string) {
  if (state.isHydrated) return undefined;
  return 'Loading ' + type;
}
