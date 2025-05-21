import { Stack } from 'expo-router';
import { AppThemeProvider } from '@/hooks/useAppTheme';
import { TolgeeProvider } from '@tolgee/react';
import { LogBox, Platform, Text, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { ScrollProvider } from '@/hooks/useScollListener';
import AppStateProvider from '@/components/smart/app-state-provider';
import { tolgee } from '@/services/tolgee';
import SnackbarProvider from '@/components/smart/snackbar-provider';

import '@/utils/date-locale';

// import { install } from 'react-native-quick-crypto';

// install();
LogBox.ignoreLogs([
  /.*is not a valid icon name.*/,
  /Open debugger to view warnings./,
]);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <TolgeeProvider tolgee={tolgee} fallback={<Text>Loading...</Text>}>
          <AppThemeProvider>
            <Stack
              layout={(e) => (
                <AppStateProvider>
                  <ScrollProvider>
                    <SnackbarProvider>{e.children}</SnackbarProvider>
                  </ScrollProvider>
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
  );
}
