import { Stack } from 'expo-router';
import { AppThemeProvider } from '@/hooks/useAppTheme';
import { DevTools, FormatSimple, Tolgee, TolgeeProvider } from '@tolgee/react';
import { LogBox, Text, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { ScrollProvider } from '@/hooks/useScollListener';
import AppStateProvider from '@/components/smart/app-state-provider';
import { tolgee } from '@/services/tolgee';
import '@/utils/date-locale';

LogBox.ignoreLogs([/.*is not a valid icon name.*/]);

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
                  <ScrollProvider>{e.children}</ScrollProvider>
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
