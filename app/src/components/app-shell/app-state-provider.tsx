import { Loader } from '@/components/foundation/loader';
import { NativeButton } from '@/components/foundation/native-button';
import BugReportIcon from '@expo/material-symbols/bug_report.xml';
import TerminalIcon from '@expo/material-symbols/terminal.xml';
import { useAppTheme, spacing } from '@/hooks/useAppTheme';
import { useAppSelector } from '@/store';
import { copyLogs } from '@/store/app';
import { T, useTranslate } from '@tolgee/react';
import * as Application from 'expo-application';
import { ReactNode, useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { openUrl } from '@/utils/open-url';
import { useDispatch } from 'react-redux';

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
  const { t } = useTranslate();
  const dispatch = useDispatch();
  const [copied, setCopied] = useState(false);

  const appVersion = Application.nativeApplicationVersion ?? Application.nativeBuildVersion ?? 'Unknown';
  const bugReportUrl = `https://github.com/LiamMorrow/LiftLog/issues/new?assignees=&labels=bug&projects=&template=bug_report.yaml&app-version=${encodeURIComponent(appVersion)}&platform=${Platform.OS}&os-version=${Platform.Version}`;

  const openBugReport = () => {
    openUrl(bugReportUrl);
  };
  const doCopyLogs = () => {
    dispatch(copyLogs());
    setCopied(true);
  };

  return (
    <View style={{ alignItems: 'center', gap: spacing[2] }}>
      <Text style={{ color: colors.onSurfaceVariant, textAlign: 'center' }}>
        <T keyName="app.stuck_loading.message" />
      </Text>
      <NativeButton
        variant="text"
        icon={BugReportIcon}
        systemImage="ladybug"
        label={t('app.stuck_loading.report.button')}
        onPress={openBugReport}
      />
      <NativeButton
        variant="text"
        icon={TerminalIcon}
        systemImage="apple.terminal"
        label={t('app.stuck_loading.copy_logs.button')}
        onPress={doCopyLogs}
      />
      {copied && (
        <Text style={{ color: colors.onSurfaceVariant, textAlign: 'center' }}>
          <T keyName="app.stuck_loading.copied.label" />
        </Text>
      )}
    </View>
  );
}

function getLoadMessage(state: { isHydrated: boolean }, type: string) {
  if (state.isHydrated) return undefined;
  return 'Loading ' + type;
}
