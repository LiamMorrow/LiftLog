import { AppThemeProvider, useAppTheme } from '@/hooks/useAppTheme';
import { I18nManager, LogBox, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppStateProvider } from '@/components/smart/app-state-provider';
import { PlanImportGate } from '@/components/smart/plan-import-gate';
import { SnackbarProvider } from '@/components/smart/snackbar-provider';
import { ConfirmProvider } from '@/components/presentation/foundation/confirm';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import ServicesProvider from '@/components/smart/services-provider';
import { install } from 'react-native-quick-crypto';
import StackWithHeader from '@/components/layout/stack-with-header';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { requireOptionalNativeModule } from 'expo';

install();

if (__DEV__) {
  // oxlint-disable-next-line typescript/no-unsafe-assignment
  const DevMenuPreferences = requireOptionalNativeModule('DevMenuPreferences');
  // oxlint-disable-next-line typescript/no-unsafe-call typescript/no-unsafe-member-access
  DevMenuPreferences?.setPreferencesAsync({ showFloatingActionButton: false, showsAtLaunch: false });
}

LogBox.ignoreAllLogs();

if (Platform.OS !== 'web') {
  I18nManager.swapLeftAndRightInRTL?.(true);
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView>
      <KeyboardProvider>
        <SafeAreaProvider>
          <ServicesProvider>
            <AppThemeProvider>
              <AppStateProvider>
                <SnackbarProvider>
                  <ConfirmProvider>
                    {Platform.OS === 'android' && <StatusBar style="auto" />}
                    <PlanImportGate />
                    <Layout />
                  </ConfirmProvider>
                </SnackbarProvider>
              </AppStateProvider>
            </AppThemeProvider>
          </ServicesProvider>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

function Layout() {
  const { colors } = useAppTheme();
  return (
    <StackWithHeader>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="exercise-search" options={{ presentation: 'modal' }} />
      <Stack.Screen name="cardio-set-editor" options={{ presentation: 'modal' }} />
      <Stack.Screen name="copy-exercise" options={{ presentation: 'modal' }} />
      <Stack.Screen name="copy-workout" options={{ presentation: 'modal' }} />
      <Stack.Screen name="rest-editor" options={{ presentation: 'modal' }} />
      <Stack.Screen name="progression-rule" options={{ presentation: 'modal' }} />
      <Stack.Screen name="progression-example" options={{ presentation: 'modal' }} />
      <Stack.Screen name="color-picker" options={{ presentation: 'modal' }} />
      <Stack.Screen
        name="welcome"
        options={{ presentation: 'fullScreenModal', headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen name="exercise-editor" options={{}} />
      <Stack.Screen name="exercise-descriptor-editor" />
      <Stack.Screen name="backend-header" />
      <Stack.Screen
        name="exercise-history"
        options={{
          presentation: 'formSheet',
          sheetAllowedDetents: [0.6, 0.95],
          sheetGrabberVisible: true,
          sheetCornerRadius: 28,
          contentStyle: { backgroundColor: colors.surface },
          headerShown: false,
        }}
      />
      <Stack.Screen name="workout-editor" />
      <Stack.Screen name="post-workout" />
      <Stack.Screen name="diff-save" />
      <Stack.Screen name="muscle-analysis" />
    </StackWithHeader>
  );
}
