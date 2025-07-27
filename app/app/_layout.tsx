import { Stack } from 'expo-router';
import { AppThemeProvider } from '@/hooks/useAppTheme';
import { TolgeeProvider } from '@tolgee/react';
import { LogBox, Platform, Text, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from '@/store';
import AppStateProvider from '@/components/smart/app-state-provider';
import { tolgee } from '@/services/tolgee';
import SnackbarProvider from '@/components/smart/snackbar-provider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import '@/utils/date-locale';
import { KeyboardProvider } from 'react-native-keyboard-controller';

// import { install } from 'react-native-quick-crypto';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://86576716425e1558b5e8622ba65d4544@o4505937515249664.ingest.us.sentry.io/4509717493383168',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,
  integrations: [Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

// install();
LogBox.ignoreLogs([
  /.*is not a valid icon name.*/,
  /Open debugger to view warnings./,
]);

export default Sentry.wrap(function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView>
      <KeyboardProvider>
        <Provider store={store}>
          <SafeAreaProvider>
            <TolgeeProvider tolgee={tolgee} fallback={<Text>Loading...</Text>}>
              <AppThemeProvider>
                <Stack
                  layout={(e) => (
                    <AppStateProvider>
                      <SnackbarProvider>{e.children}</SnackbarProvider>
                    </AppStateProvider>
                  )}
                  screenOptions={{
                    headerShown: false,
                    statusBarTranslucent: true,
                    statusBarBackgroundColor: 'transparent',
                    navigationBarTranslucent: true,
                    navigationBarColor: 'transparent',
                    statusBarStyle:
                      Platform.OS === 'android'
                        ? colorScheme === 'dark'
                          ? 'light'
                          : 'dark'
                        : undefined,
                    gestureEnabled: false,
                  }}
                />
              </AppThemeProvider>
            </TolgeeProvider>
          </SafeAreaProvider>
        </Provider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
});
