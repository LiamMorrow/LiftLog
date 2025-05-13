import { Stack } from 'expo-router';
import { AppThemeProvider } from '@/hooks/useAppTheme';
import { TolgeeProvider } from '@tolgee/react';
import { LogBox, Text, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { ScrollProvider } from '@/hooks/useScollListener';
import AppStateProvider from '@/components/smart/app-state-provider';
import { tolgee } from '@/services/tolgee';
import SnackbarProvider from '@/components/smart/snackbar-provider';

import '@/utils/date-locale';

import PolyfillCrypto from 'react-native-webview-crypto';

LogBox.ignoreLogs([/.*is not a valid icon name.*/]);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <Provider store={store}>
      <PolyfillCrypto />
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
                statusBarStyle: colorScheme === 'dark' ? 'light' : 'dark',
                gestureEnabled: false,
              }}
            />
          </AppThemeProvider>
        </TolgeeProvider>
      </SafeAreaProvider>
    </Provider>
  );
}
