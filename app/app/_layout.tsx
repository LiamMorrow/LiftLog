import { Stack } from 'expo-router';
import { AppThemeProvider } from '@/hooks/useAppTheme';
import { LogBox, Platform, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { AppStateProvider } from '@/components/smart/app-state-provider';
import SnackbarProvider from '@/components/smart/snackbar-provider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '@/utils/date-locale';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import * as Sentry from '@sentry/react-native';
import ServicesProvider from '@/components/smart/services-provider';

Sentry.init({
  dsn: 'https://86576716425e1558b5e8622ba65d4544@o4505937515249664.ingest.us.sentry.io/4509717493383168',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
  attachViewHierarchy: true,
});

// install();
LogBox.ignoreLogs([
  /.*is not a valid icon name.*/,
  /Open debugger to view warnings./,
  /.*useInsertionEffect.*/,
]);

export default Sentry.wrap(function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView>
      <KeyboardProvider>
        <Provider store={store}>
          <SafeAreaProvider>
            <ServicesProvider>
              <AppThemeProvider>
                <AppStateProvider>
                  <SnackbarProvider>
                    <Stack
                      screenOptions={{
                        headerShown: false,
                        statusBarStyle:
                          Platform.OS === 'android'
                            ? colorScheme === 'dark'
                              ? 'light'
                              : 'dark'
                            : undefined,
                        gestureEnabled: false,
                      }}
                    />
                  </SnackbarProvider>
                </AppStateProvider>
              </AppThemeProvider>
            </ServicesProvider>
          </SafeAreaProvider>
        </Provider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
});
